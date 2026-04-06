import { Err, err, ok, Result } from "neverthrow";

export type Er<K extends string> = {
  tag: K;
  message: string;
};

function _new<K extends string>(tag: K, message: string): Er<K> {
  return {
    tag: tag,
    message: message,
  };
}

function _err<K extends string>(tag: K, message: string): Err<never, Er<K>> {
  return err(_new(tag, message));
}

function newFail(message: string): never {
  throw {
    tag: "failure",
    message: message,
  };
}

function fail<E extends string>(er: Er<E>): never {
  return newFail(`${er.tag}: ${er.message}`);
}

/** add context prefix to the message. */
function wrap(context: string) {
  return <E extends Er<string>>(error: E): E =>
    ({
      tag: error.tag,
      message: `${context}.${error.message}`,
    }) as E;
}

/** throw specific tags, pass others through. */
function failErs<const F extends string>(...tags: F[]) {
  return <E extends string>(
    error: [F] extends [E] ? Er<E> : `Invalid tags: ${Exclude<F, E> & string}`,
  ): Er<Exclude<E, F>> => {
    if ((tags as string[]).includes((error as Er<E>).tag)) {
      fail(error as Er<string>);
    }
    return error as Er<Exclude<E, F>>;
  };
}

/** merge specific tags into a new tag, keeping the original message. */
function mergeErs<const F extends string, N extends string>(tags: F[], newTag: N) {
  return <E extends string>(
    error: [F] extends [E] ? Er<E> : `Invalid tags: ${Exclude<F, E> & string}`,
  ): Er<Exclude<E, F> | N> => {
    if ((tags as string[]).includes((error as Er<E>).tag)) {
      return _new(newTag, (error as Er<E>).message) as Er<N>;
    }
    return error as Er<Exclude<E, F> | N>;
  };
}

type CollapseEr<E extends string> = [E] extends [never] ? never : Er<E>;

/** swallow specific tags into ok(undefined), pass others as err. */
function swallow<const F extends string>(...tags: F[]) {
  return <E extends string>(
    error: [F] extends [E] ? Er<E> : `Invalid tags: ${Exclude<F, E> & string}`,
  ): Result<void, CollapseEr<Exclude<E, F>>> => {
    if ((tags as string[]).includes((error as Er<E>).tag)) {
      return ok(undefined);
    }
    return err(error as Er<Exclude<E, F>>) as Result<void, CollapseEr<Exclude<E, F>>>;
  };
}

function swallowInto<T, const F extends string>(out: T, ...tags: F[]) {
  return <E extends string>(
    error: [F] extends [E] ? Er<E> : `Invalid tags: ${Exclude<F, E> & string}`,
  ): Result<T, CollapseEr<Exclude<E, F>>> => {
    if ((tags as string[]).includes((error as Er<E>).tag)) {
      return ok(out);
    }
    return err(error as Er<Exclude<E, F>>) as Result<T, CollapseEr<Exclude<E, F>>>;
  };
}

export const Er = {
  new: _new,
  err: _err,
  newFail,
  fail,
  wrap,
  failErs,
  mergeErs,
  swallow,
  swallowInto,
};
