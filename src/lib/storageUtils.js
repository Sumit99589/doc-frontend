// your_fetch_file.js (or whatever you called it)
import { supabase } from './supabaseClient'; // Make sure this is the correct client

/**
 * Fetches all files recursively from a Supabase storage bucket.
 * @param {string} bucketName - The name of the bucket.
 * @param {string} path - The starting path (use '' for the root).
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of file objects.
 */
export async function fetchAllFiles(bucketName, path = '') {
  // Let's log the parameters being used for the query
  console.log(`Attempting to list files from bucket: "${bucketName}" at path: "${path}"`);

  const { data, error } = await supabase.storage.from(bucketName).list(path);

  // LOG THE RESPONSE HERE
  console.log('Supabase list() response - Data:', data);
  console.log('Supabase list() response - Error:', error);

  if (error) {
    console.error(`Error listing files at path "${path}":`, error);
    return [];
  }

  // Rest of your function...
  let allFiles = [];

  for (const file of data) {
    if (file.id) {
        if (file.name !== '.emptyFolderPlaceholder') {
          allFiles.push({ ...file, path: path ? `${path}/${file.name}` : file.name });
        }
    } 
    else {
      const subFiles = await fetchAllFiles(bucketName, path ? `${path}/${file.name}` : file.name);
      allFiles = allFiles.concat(subFiles);
    }
  }

  return allFiles;
}