import type {
  IValidationResult,
  ISuppliersImport,
  IEmployeesImport,
} from "@/types";

export function validateSuppliersJson(data: unknown): IValidationResult {
  const errors: string[] = [];

  if (!data || typeof data !== "object") {
    return { valid: false, errors: ["Data must be a JSON object"] };
  }

  const obj = data as Record<string, unknown>;

  if (!Array.isArray(obj.suppliers)) {
    return { valid: false, errors: ["Missing 'suppliers' array"] };
  }

  const seenSupplierIds = new Set<string>();
  const seenProductIds = new Set<string>();

  for (let i = 0; i < obj.suppliers.length; i++) {
    const supplier = obj.suppliers[i] as Record<string, unknown>;
    const prefix = `Supplier[${i}]`;

    if (!supplier.id || typeof supplier.id !== "string") {
      errors.push(`${prefix}: missing or invalid 'id'`);
    } else if (seenSupplierIds.has(supplier.id)) {
      errors.push(`${prefix}: duplicate id '${supplier.id}'`);
    } else {
      seenSupplierIds.add(supplier.id);
    }

    if (!supplier.name || typeof supplier.name !== "string") {
      errors.push(`${prefix}: missing or invalid 'name'`);
    }

    if (!Array.isArray(supplier.products)) {
      errors.push(`${prefix}: missing 'products' array`);
      continue;
    }

    for (let j = 0; j < supplier.products.length; j++) {
      const product = supplier.products[j] as Record<string, unknown>;
      const pPrefix = `${prefix}.products[${j}]`;

      if (!product.id || typeof product.id !== "string") {
        errors.push(`${pPrefix}: missing or invalid 'id'`);
      } else if (seenProductIds.has(product.id)) {
        errors.push(`${pPrefix}: duplicate product id '${product.id}'`);
      } else {
        seenProductIds.add(product.id);
      }

      if (!product.name || typeof product.name !== "string") {
        errors.push(`${pPrefix}: missing or invalid 'name'`);
      }

      if (
        typeof product.costPerUnit !== "number" ||
        product.costPerUnit < 0
      ) {
        errors.push(`${pPrefix}: 'costPerUnit' must be a non-negative number`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateEmployeesJson(data: unknown): IValidationResult {
  const errors: string[] = [];

  if (!data || typeof data !== "object") {
    return { valid: false, errors: ["Data must be a JSON object"] };
  }

  const obj = data as Record<string, unknown>;

  if (!Array.isArray(obj.employees)) {
    return { valid: false, errors: ["Missing 'employees' array"] };
  }

  const seenIds = new Set<string>();

  for (let i = 0; i < obj.employees.length; i++) {
    const emp = obj.employees[i] as Record<string, unknown>;
    const prefix = `Employee[${i}]`;

    if (!emp.id || typeof emp.id !== "string") {
      errors.push(`${prefix}: missing or invalid 'id'`);
    } else if (seenIds.has(emp.id)) {
      errors.push(`${prefix}: duplicate id '${emp.id}'`);
    } else {
      seenIds.add(emp.id);
    }

    if (!emp.name || typeof emp.name !== "string") {
      errors.push(`${prefix}: missing or invalid 'name'`);
    }

    if (
      emp.commissionType !== "flat" &&
      emp.commissionType !== "tiered" &&
      emp.commissionType !== "hourly"
    ) {
      errors.push(
        `${prefix}: 'commissionType' must be 'flat', 'tiered', or 'hourly'`
      );
      continue;
    }

    if (emp.commissionType === "flat") {
      if (typeof emp.flatRate !== "number" || emp.flatRate < 0) {
        errors.push(`${prefix}: 'flatRate' must be a non-negative number`);
      }
    }

    if (emp.commissionType === "hourly") {
      if (typeof emp.hourlyRate !== "number" || emp.hourlyRate < 0) {
        errors.push(
          `${prefix}: 'hourlyRate' must be a non-negative number`
        );
      }
    }

    if (emp.commissionType === "tiered") {
      if (emp.tieredMode !== "flat" && emp.tieredMode !== "marginal") {
        errors.push(
          `${prefix}: 'tieredMode' must be 'flat' or 'marginal'`
        );
      }

      if (!Array.isArray(emp.tiers) || emp.tiers.length === 0) {
        errors.push(`${prefix}: 'tiers' must be a non-empty array`);
      } else {
        const tiers = emp.tiers as { threshold?: unknown; rate?: unknown }[];
        let prevThreshold = -1;

        for (let j = 0; j < tiers.length; j++) {
          const tier = tiers[j];
          const tPrefix = `${prefix}.tiers[${j}]`;

          if (typeof tier.threshold !== "number" || tier.threshold < 0) {
            errors.push(
              `${tPrefix}: 'threshold' must be a non-negative number`
            );
          } else {
            if (tier.threshold <= prevThreshold) {
              errors.push(
                `${tPrefix}: thresholds must be strictly ascending`
              );
            }
            prevThreshold = tier.threshold;
          }

          if (typeof tier.rate !== "number" || tier.rate < 0) {
            errors.push(
              `${tPrefix}: 'rate' must be a non-negative number`
            );
          }
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export function parseSuppliersJson(raw: string): {
  data: ISuppliersImport | null;
  validation: IValidationResult;
} {
  try {
    const parsed = JSON.parse(raw);
    const validation = validateSuppliersJson(parsed);
    return {
      data: validation.valid ? (parsed as ISuppliersImport) : null,
      validation,
    };
  } catch {
    return {
      data: null,
      validation: { valid: false, errors: ["Invalid JSON format"] },
    };
  }
}

export function parseEmployeesJson(raw: string): {
  data: IEmployeesImport | null;
  validation: IValidationResult;
} {
  try {
    const parsed = JSON.parse(raw);
    const validation = validateEmployeesJson(parsed);
    return {
      data: validation.valid ? (parsed as IEmployeesImport) : null,
      validation,
    };
  } catch {
    return {
      data: null,
      validation: { valid: false, errors: ["Invalid JSON format"] },
    };
  }
}
