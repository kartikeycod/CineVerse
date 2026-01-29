import { useState } from "react";
import {
  addDoc,
  collection,
  doc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";
import { auth } from "../../firebase/auth";
import { db } from "../../firebase/firestore";
import { storage } from "../../firebase/storage";
import LocationSearch from "./LocationSearch";
import "./Theater.css";

function AddTheater() {
  // Ensure user is logged in to avoid "cannot read property uid of null"
  const uid = auth.currentUser?.uid;

  const [name, setName] = useState("");
  const [ownerName, setOwnerName] = useState(""); // ✅ Added missing state
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState(null);
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState("active");
  const [loading, setLoading] = useState(false); // ✅ Added missing loading state

  const uploadImages = async () => {
    const urls = [];
    for (const file of images) {
      // It's safer to use a unique ID + file name
      const imgRef = ref(storage, `theaters/${uid}/${Date.now()}-${file.name}`);
      await uploadBytes(imgRef, file);
      const downloadURL = await getDownloadURL(imgRef);
      urls.push(downloadURL);
    }
    return urls;
  };

  const saveTheater = async () => {
    if (!name || !phone || !location || !uid) {
      alert("Fill all required fields and ensure you are logged in.");
      return;
    }

    setLoading(true); // Start loading

    try {
      // 1. Ensure owner exists (Merge ensures we don't overwrite other data)
      await setDoc(
        doc(db, "owners", uid),
        {
          ownerId: uid,
          ownerName: ownerName, // Use the new state variable
          contact: { phone, email },
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );

      // 2. Upload images first to get URLs
      const imageUrls = await uploadImages();

      // 3. Save Theater document
      await addDoc(collection(db, "theaters"), {
        name,
        ownerId: uid,
        contact: { phone, email },
        address,
        city: location.city,
        area: location.area,
        location: {
          lat: location.lat,
          lng: location.lng
        },
        images: imageUrls,
        status,
        createdAt: serverTimestamp()
      });

      alert("Theater added successfully!");
      // Optional: Reset form or navigate away here
    } catch (error) {
      console.error("Error saving theater:", error);
      alert("Failed to save theater. Check console for details.");
    } finally {
      setLoading(false); // Stop loading regardless of success/fail
    }
  };

  return (
    <div className="theater-wrapper">
      <h2>Add Theater</h2>

      <input
        placeholder="Theater Name *"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      {/* ✅ Fixed: ownerName state now exists */}
      <input
        placeholder="Owner / Chain Name *"
        value={ownerName}
        onChange={(e) => setOwnerName(e.target.value)}
      />

      <input
        placeholder="Contact Phone *"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <input
        placeholder="Support Email (optional)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <textarea
        placeholder="Full Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      <LocationSearch onSelect={setLocation} />

      {location && (
        <p className="location-preview">
          📍 {location.area} ({location.lat}, {location.lng})
        </p>
      )}

      <div className="file-upload">
        <label>Upload Images:</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setImages(Array.from(e.target.files))} // Convert FileList to Array
        />
      </div>

      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>

      <button onClick={saveTheater} disabled={loading}>
        {loading ? "Saving..." : "Save Theater"}
      </button>
    </div>
  );
}

export default AddTheater;