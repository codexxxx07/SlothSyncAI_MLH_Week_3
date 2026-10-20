import { invoke } from '@tauri-apps/api/core';

export const scanDirectory = async (path) => {
  try {
    const result = await invoke('scan_directory', { path });
    return result;
  } catch (error) {
    console.error('Error scanning directory:', error);
    throw error;
  }
};

export const selectDirectory = async () => {
  try {
    const path = await invoke('select_directory');
    return path;
  } catch (error) {
    console.error('Error selecting directory:', error);
    throw error;
  }
};
