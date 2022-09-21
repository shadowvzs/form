export function file2Base64(file: File): Promise<string> {
    if (file instanceof File === false) { return Promise.resolve(''); }
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () { resolve(reader.result as string); };
        reader.onerror = reject;
    });
};