import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth"; // REMOVED 'auth' from here
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, FIREBASE_DB } from "../firebase";

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    
    const uid = userCredential.user.uid;
    const userdoc = await getDoc(doc(FIREBASE_DB, "accounts", uid));
    const userData = userdoc.data();

    localStorage.setItem("name", userData.fullName);
    localStorage.setItem("uid", uid);

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const signupUser = async (name, email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;
    localStorage.setItem("uid", user.uid);
    localStorage.setItem("email", email);
    localStorage.setItem("name", name);

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const submitSurvey = async (formData) => {
  const uid = localStorage.getItem("uid");
  const defaultUserData = {
    fullName: localStorage.getItem("name"),
    emailAdd: localStorage.getItem("email"),
    age: formData.age,
    gender: formData.gender,
    school: formData.school,
    major: formData.major,
    companies: formData.companies || [],
    resume: null,
    updatedAt: new Date()
  };

  await setDoc(
    doc(FIREBASE_DB, "accounts", uid),
    defaultUserData,
    { merge: true }
  );
};

export const logoutUser = async () => {
  await signOut(auth);
  localStorage.removeItem("token");
};

export const getCurrentUser = () => {
  return auth.currentUser;
};