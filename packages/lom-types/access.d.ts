// Types for typed access to LOM objects through a wrapper such as LiveObject.
// Hand-written; merges with the generated Lom namespace in index.d.ts.

declare namespace Lom {
  /**
   * Registers the wrapper type that children resolve to. Empty by default; a wrapper
   * implementation adds an `object` member through declaration merging:
   *
   * ```ts
   * declare global {
   *   namespace Lom {
   *     interface ObjectTypes<C extends ClassName> {
   *       object: LiveObject<C>;
   *     }
   *   }
   * }
   * ```
   */
  interface ObjectTypes<C extends ClassName> {}

  /** The registered wrapper type for class C, or `unknown` if none is registered. */
  type ObjectType<C extends ClassName> = ObjectTypes<C> extends { object: infer O } ? O : unknown;

  /**
   * Value of child or property K of class C: an array of wrappers for list children,
   * a wrapper or null for single children, and the property type otherwise.
   */
  type MemberValue<C extends ClassName, K> = K extends keyof Children<C>
    ? Children<C>[K] extends { class: infer T extends ClassName; list: infer L }
      ? L extends true
        ? ObjectType<T>[]
        : ObjectType<T> | null
      : never
    : PropertyType<C, K>;

  /** Arguments of function F of class C. */
  type FunctionArgs<C extends ClassName, F> = F extends keyof Functions<C>
    ? Functions<C>[F] extends (...args: infer A) => any
      ? A
      : never
    : never;

  /** `unknown` for literal paths that resolve to a LOM class, an error object type otherwise. */
  type ValidPath<P extends string> = [ClassAtPath<P>] extends [never]
    ? {
        error: "not a valid Live API path; use a constructor with an explicit class for runtime paths";
      }
    : unknown;

  /** Children and properties of C that can be read but not set. */
  type GetOnly<C extends ClassName> = Exclude<MemberWith<C, "get">, MemberWith<C, "set">>;

  /** Children and properties of C that can be read and set. */
  type GetSet<C extends ClassName> = MemberWith<C, "get"> & MemberWith<C, "set">;

  /**
   * Accessors for the members of class C: gettable children and properties as fields
   * (readonly unless settable), functions as methods. Member docs carry over from Classes.
   */
  type Accessors<C extends ClassName> = {
    readonly [K in keyof Children<C> as K extends GetOnly<C> ? K : never]: MemberValue<C, K>;
  } & { [K in keyof Children<C> as K extends GetSet<C> ? K : never]: MemberValue<C, K> } & {
    readonly [K in keyof Properties<C> as K extends GetOnly<C> ? K : never]: MemberValue<C, K>;
  } & { [K in keyof Properties<C> as K extends GetSet<C> ? K : never]: MemberValue<C, K> } & {
    [F in keyof Functions<C>]: (...args: FunctionArgs<C, F>) => any;
  };
}
