import { invoke } from '@tauri-apps/api/core';

export const findDuplicates = async (files) => {
  try {
    const result = await invoke('find_duplicates', { files });
    return result;
  } catch (error) {
    console.error('Error finding duplicates:', error);
    throw error;
  }
};

export const computeFileHash = async (path) => {
  try {
    const result = await invoke('compute_file_hash', { path });
    return result;
  } catch (error) {
    console.error('Error computing hash:', error);
    throw error;
  }
};
