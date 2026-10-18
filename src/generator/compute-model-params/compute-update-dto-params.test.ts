import type { Model } from '../types';
import { makeHelpers } from '../template-helpers';
import { computeUpdateDtoParams } from './compute-update-dto-params';

const scalar = (name: string, documentation?: string) => ({
  name,
  documentation,
  kind: 'scalar',
  type: 'String',
  isRequired: true,
  isList: false,
  isUnique: false,
  isId: false,
  isReadOnly: false,
  hasDefaultValue: false,
  isGenerated: false,
  isUpdatedAt: false,
});

const model = {
  name: 'User',
  dbName: null,
  fields: [
    scalar('email', '@DtoUpdateRequired'),
    scalar('password', '@DtoExclude\n@DtoUpdateRequired'),
  ],
  primaryKey: null,
  uniqueFields: [],
  uniqueIndexes: [],
  output: { dto: 'src', entity: 'src' },
} as unknown as Model;

const templateHelpers = makeHelpers({
  connectDtoPrefix: 'Connect',
  createDtoPrefix: 'Create',
  updateDtoPrefix: 'Update',
  dtoSuffix: 'Dto',
  entityPrefix: '',
  entitySuffix: '',
  classValidation: true,
  outputType: 'class',
  noDependencies: false,
  definiteAssignmentAssertion: false,
  requiredResponseApiProperty: true,
  outputPath: 'src',
  prismaClientImportPath: '@prisma/client',
  outputApiPropertyType: true,
  wrapRelationsAsType: false,
  showDefaultValues: false,
  globalExcludeFields: [],
});

describe('computeUpdateDtoParams', () => {
  const { fields } = computeUpdateDtoParams({
    model,
    allModels: [model],
    templateHelpers,
  });
  const field = (name: string) => fields.find((f) => f.name === name);
  const validators = (name: string) =>
    field(name)?.classValidators?.map((v) => v.name);

  it('keeps @DtoUpdateRequired fields required', () => {
    expect(field('email')?.isRequired).toBe(true);
    expect(validators('email')).toContain('IsNotEmpty');
  });

  it('makes excluded fields optional so the DTO stays satisfiable', () => {
    expect(field('password')?.isRequired).toBe(false);
    expect(validators('password')).toContain('IsOptional');
    expect(validators('password')).not.toContain('IsNotEmpty');
    expect(
      field('password')?.classTransformers?.map((t) => t.name),
    ).toStrictEqual(['Exclude']);
  });
});
