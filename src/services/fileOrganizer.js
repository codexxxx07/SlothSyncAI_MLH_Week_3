import { invoke } from '@tauri-apps/api/core';

export const moveFile = async (source, destination) => {
  try {
    const result = await invoke('move_file', { source, destination });
    return result;
  } catch (error) {
    console.error('Error moving file:', error);
    throw error;
  }
};

export const renameFile = async (oldPath, newName) => {
  try {
    const result = await invoke('rename_file', { oldPath, newName });
    return result;
  } catch (error) {
    console.error('Error renaming file:', error);
    throw error;
  }
};
