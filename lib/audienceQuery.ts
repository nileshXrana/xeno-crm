import { IAudienceRule } from "@/models/Campaign";

type MongoQuery = Record<string, unknown>;

/**
 * Converts a flat list of audience rules (with AND/OR logic chaining)
 * into a MongoDB query filter object for the Customer collection.
 *
 * The logic field on each rule defines how that rule combines with the NEXT rule.
 * e.g. [{ field: "totalSpends", op: ">", value: 10000, logic: "AND" }, { field: "visits", op: "<=", value: 3, logic: "AND" }]
 * produces: { $and: [{ totalSpends: { $gt: 10000 } }, { visits: { $lte: 3 } }] }
 */

const OPERATOR_MAP: Record<string, string> = {
  ">": "$gt",
  ">=": "$gte",
  "<": "$lt",
  "<=": "$lte",
  "==": "$eq",
  "!=": "$ne",
};

function buildSingleCondition(rule: IAudienceRule): MongoQuery {
  const mongoOp = OPERATOR_MAP[rule.operator];
  if (!mongoOp) {
    throw new Error(`Unknown operator: ${rule.operator}`);
  }

  // Handle date field conversion
  let value: unknown = rule.value;
  if (rule.field === "lastVisitDate" && typeof value === "string") {
    value = new Date(value);
  } else if (typeof value === "string" && !isNaN(Number(value))) {
    value = Number(value);
  }

  return { [rule.field]: { [mongoOp]: value } };
}

export function buildAudienceQuery(rules: IAudienceRule[]): MongoQuery {
  if (!rules || rules.length === 0) return {};

  if (rules.length === 1) {
    return buildSingleCondition(rules[0]);
  }

  // Walk through rules and group them by AND/OR
  // Simple left-to-right grouping: each rule's .logic says "combine ME with NEXT using this logic"
  const andConditions: MongoQuery[] = [];
  const orConditions: MongoQuery[] = [];

  // Default: all AND if not specified
  const allAnd = rules.every((r) => r.logic === "AND" || !r.logic);
  const allOr = rules.every((r) => r.logic === "OR");

  if (allAnd) {
    return { $and: rules.map(buildSingleCondition) };
  }

  if (allOr) {
    return { $or: rules.map(buildSingleCondition) };
  }

  // Mixed logic: group AND conditions together, wrap with OR
  let currentAndGroup: MongoQuery[] = [buildSingleCondition(rules[0])];

  for (let i = 0; i < rules.length - 1; i++) {
    const rule = rules[i];
    const nextCondition = buildSingleCondition(rules[i + 1]);

    if (rule.logic === "AND") {
      currentAndGroup.push(nextCondition);
    } else {
      // OR: close current AND group, start new one
      andConditions.push(
        currentAndGroup.length === 1
          ? currentAndGroup[0]
          : { $and: currentAndGroup }
      );
      orConditions.push(...andConditions.splice(0));
      currentAndGroup = [nextCondition];
    }
  }

  // Push last group
  if (currentAndGroup.length > 0) {
    andConditions.push(
      currentAndGroup.length === 1
        ? currentAndGroup[0]
        : { $and: currentAndGroup }
    );
  }

  const allGroups = [...orConditions, ...andConditions];

  if (allGroups.length === 1) return allGroups[0];
  return { $or: allGroups };
}
