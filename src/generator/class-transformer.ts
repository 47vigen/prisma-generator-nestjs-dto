import { IClassTransformer, ImportStatementParams, ParsedField } from './types';
import { isAnnotatedWith } from './field-classifiers';
import { DTO_EXCLUDE, DTO_INCLUDE } from './annotations';

export const parseClassTransformers = (
  field: ParsedField,
  globalExcludeFields: string[] = [],
): IClassTransformer[] => {
  const decorators: IClassTransformer[] = [];

  // Check if field is in global exclude fields
  if (globalExcludeFields.includes(field.name)) {
    decorators.push({ name: 'Exclude' });
  }

  if (isAnnotatedWith(field, DTO_EXCLUDE)) {
    decorators.push({ name: 'Exclude' });
  }

  if (isAnnotatedWith(field, DTO_INCLUDE)) {
    decorators.push({ name: 'Expose' });
  }

  return decorators;
};

export const decorateClassTransformers = (decorators: IClassTransformer[]) =>
  decorators.map((decorator) => {
    if (decorator.value) {
      return `@${decorator.name}(${decorator.value})`;
    }
    return `@${decorator.name}()`;
  });

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
