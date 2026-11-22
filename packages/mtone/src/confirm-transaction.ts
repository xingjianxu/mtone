type ConfirmTransaction<T> = {
  invoke: () => T | PromiseLike<T>;
  /** Dialogs show pending on every attempt; popovers show it only for thenables. */
  alwaysPending?: boolean;
  /** Prevent an old attempt from modifying a replacement popup session. */
  isCurrent?: () => boolean;
  onPending: () => void;
  onFinish: () => void;
  onResolve: (value: T, finish: () => void) => void;
  onReject: (error: unknown, finish: () => void) => void;
};

/** Share invocation and settlement, leaving open state and result policy to each surface. */
export async function runConfirmTransaction<T>({
  invoke,
  alwaysPending = false,
  isCurrent = () => true,
  onPending,
  onFinish,
  onResolve,
  onReject,
}: ConfirmTransaction<T>): Promise<void> {
  let finished = false;
  // Popconfirm releases its busy lock before requesting a close or reporting an error.
  // ConfirmDialog leaves pending in place until its close callback has returned.
  function finish() {
    if (finished || !isCurrent()) return;
    finished = true;
    onFinish();
  }

  if (alwaysPending) onPending();
  try {
    const result = invoke();
    if (
      !alwaysPending &&
      result &&
      typeof (result as PromiseLike<T>).then === "function"
    ) {
      onPending();
    }
    const value = await result;
    if (isCurrent()) onResolve(value, finish);
  } catch (error) {
    if (isCurrent()) onReject(error, finish);
  } finally {
    finish();
  }
}
