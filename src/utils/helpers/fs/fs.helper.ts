import { readdir, unlink } from "fs/promises";
import { join } from "path";

export const getPath = (...path: string[]) => join(...path);

export const deleteFile = async (path: string) => {
  try {
    await unlink(path);
  } catch (error) {
    console.error(error);
  }
};

export const deleteAllFiles = async (
  path: string,
  exceptions: string[] = []
) => {
  const exceptionsCase = [...exceptions, "index.ts", ".gitkeep"];
  try {
    const files = await readdir(path);
    await Promise.all(
      files
        .filter((file) => !exceptionsCase.includes(file))
        .map((file) => unlink(join(path, file)))
    );
  } catch (error) {
    console.error(error);
  }
};
