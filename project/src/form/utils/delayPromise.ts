const delayPromise = (delayInMs: number) => new Promise((res) => setTimeout(res, delayInMs));

export default delayPromise;