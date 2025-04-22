export const uploadFileToPinata = async (file: File): Promise<string> => {
  try {
    // Fetch the presigned URL from your backend
    const urlRes = await fetch(`${import.meta.env.VITE_SERVER_URL}/presigned_url`, {
      method: "GET",
    });

    // Parse the URL returned from the server
    const { url } = await urlRes.json();
    
    if (!url) {
      throw new Error("Failed to retrieve presigned URL.");
    }

    // Create a FormData instance and append the file
    const formData = new FormData();
    formData.append("file", file);

    // Upload the file to Pinata via the presigned URL
    const uploadRes = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!uploadRes.ok) {
      throw new Error("Error uploading the file to Pinata.");
    }

    // Get the response with the CID from Pinata
    const uploadData = await uploadRes.json();
    console.log("Pinata upload response:", uploadData);

    const { data: { cid } } = uploadData;
    console.log("The CID is", cid)

    if (!cid) throw new Error("CID not found in upload response");

    const gateway = import.meta.env.VITE_PINATA_GATEWAY_URL;
    if (!gateway) throw new Error("Missing VITE_GATEWAY_URL in environment");
    
    const ipfsUrl = `${gateway}/ipfs/${cid}`;
    return ipfsUrl;  // Return the URL for the uploaded file

  } catch (error) {
    throw new Error(`Upload failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};
