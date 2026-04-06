import { Err, err } from "neverthrow";

export type Er<K extends string> = {
  tag: K;
  message: string;
};

export function newEr<K extends string>(tag: K, message: string): Er<K> {
  return {
    tag: tag,
    message: message,
  };
}

export function er<K extends string>(
  tag: K,
  message: string,
): Err<never, Er<K>> {
  return err(newEr(tag, message));
}

export function wrap<P extends string>(prefix: P) {
  return <E extends Er<string>>(
    error: E,
  ): E extends Er<infer K extends string> ? Er<`${P}.${K}`> : never =>
    ({
      tag: `${prefix}.${error.tag}`,
      message: error.message,
    }) as E extends Er<infer K extends string> ? Er<`${P}.${K}`> : never;
}

export type Failure = Er<"failure">;

export function newFail(message: string): Failure {
  return {
    tag: "failure",
    message: message,
  };
}

export function fail<E extends string>(er: Er<E>): Err<never, Failure> {
  return err(newFail(`${er.tag}: ${er.message}`));
}
