import type { ParsedField } from './types';
import {
  decorateClassTransformers,
  parseClassTransformers,
} from './class-transformer';

const field = (name: string, documentation?: string) =>
  ({ name, documentation }) as ParsedField;

describe('class-transformer', () => {
  it('excludes globally matched fields in both directions', () => {
    expect(
      decorateClassTransformers(
        parseClassTransformers(field('deletedAt'), ['*At']),
      ),
    ).toBe('@Exclude()\n');
  });

  it('excludes @DtoExclude fields in both directions', () => {
    expect(
      decorateClassTransformers(
        parseClassTransformers(field('secret', '@DtoExclude')),
      ),
    ).toBe('@Exclude()\n');
  });

  it('lets @DtoExpose opt out of exclusion', () => {
    expect(
      decorateClassTransformers(
        parseClassTransformers(field('createdAt', '@DtoExpose'), ['*At']),
      ),
    ).toBe('@Expose()\n');
  });
});
