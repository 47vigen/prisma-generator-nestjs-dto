import type { Model } from '../types';
import { makeHelpers } from '../template-helpers';
import { computeConnectDtoParams } from './compute-connect-dto-params';

const model = {
  name: 'User',
  dbName: null,
  fields: [
    {
      name: 'id',
      kind: 'scalar',
      type: 'String',
      isRequired: true,
      isList: false,
      isUnique: false,
      isId: true,
      isReadOnly: false,
      hasDefaultValue: false,
      isGenerated: false,
      isUpdatedAt: false,
    },
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
  globalExcludeFields: ['id'],
});

describe('computeConnectDtoParams', () => {
  it('keeps globally excluded selectors as client input', () => {
    const { fields, imports } = computeConnectDtoParams({
      model,
      templateHelpers,
    });
    const id = fields.find((f) => f.name === 'id');

    expect(id?.classTransformers ?? []).toStrictEqual([]);
    expect(id?.apiHideProperty).toBeFalsy();
    expect(id?.classValidators?.map((v) => v.name)).toContain('IsNotEmpty');
    expect(imports.some((i) => i.from === 'class-transformer')).toBe(false);
  });
});
