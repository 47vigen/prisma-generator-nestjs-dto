import { IClassTransformer, ImportStatementParams, ParsedField } from './types';
import { isAnnotatedWith } from './field-classifiers';
import { DTO_EXCLUDE, DTO_EXPOSE } from './annotations';

const matchesPattern = (fieldName: string, pattern: string): boolean => {
  // Exact match
  if (pattern === fieldName) {
    return true;
  }

  // Pattern matching with wildcards
  if (pattern.includes('*')) {
    // EndsWith: *id matches userId, postId, etc.
    if (pattern.startsWith('*') && !pattern.endsWith('*')) {
      const suffix = pattern.substring(1);
      return fieldName.endsWith(suffix);
    }

    // StartsWith: id* matches idField, idValue, etc.
    if (pattern.endsWith('*') && !pattern.startsWith('*')) {
      const prefix = pattern.substring(0, pattern.length - 1);
      return fieldName.startsWith(prefix);
    }

    // Contains: *id* matches userId, myIdField, etc.
    if (pattern.startsWith('*') && pattern.endsWith('*')) {
      const substring = pattern.substring(1, pattern.length - 1);
      return fieldName.includes(substring);
    }
  }

  return false;
};

export const parseClassTransformers = (
  field: ParsedField,
  globalExcludeFields: string[] = [],
): IClassTransformer[] => {
  const decorators: IClassTransformer[] = [];

  const isExposed = isAnnotatedWith(field, DTO_EXPOSE);

  // @DtoExpose explicitly opts a field out of globalExcludeFields and @DtoExclude.
  if (isExposed) {
    decorators.push({ name: 'Expose' });
    return decorators;
  }

  const shouldExclude = globalExcludeFields.some((pattern) =>
    matchesPattern(field.name, pattern),
  );

  if (shouldExclude || isAnnotatedWith(field, DTO_EXCLUDE)) {
    decorators.push({ name: 'Exclude', value: '{ toPlainOnly: true }' });
  }

  return decorators;
};

export const decorateClassTransformers = (
  decorators: IClassTransformer[],
): string => {
  if (!decorators.length) return '';

  let output = '';
  decorators.forEach((decorator) => {
    output += decorator.value
      ? `@${decorator.name}(${decorator.value})\n`
      : `@${decorator.name}()\n`;
  });
  return output;
};

export const makeImportsFromClassTransformer = (
  classTransformers: IClassTransformer[],
): ImportStatementParams[] => {
  const packageNames = classTransformers.map(({ name }) => name);
  const uniqPackageNames = [...new Set(packageNames)];

  if (uniqPackageNames.length === 0) return [];

  return [
    {
      from: 'class-transformer',
      destruct: uniqPackageNames,
    },
  ];
};
