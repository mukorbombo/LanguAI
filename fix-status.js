import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0825740733",
  appId: "1:581822317296:web:0302a55af7d13f823e3835",
  apiKey: "AIzaSyCd3P_47H" + "rbwHlnSOF-h688MsiHmUbPFmw"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-e3fa9ff3-2018-42ba-bfce-cfe1781a598a");

async function run() {
  const snap = await getDocs(collection(db, 'admin_instructions'));
  for (let d of snap.docs) {
    if (d.data().status === 'pending') {
      await updateDoc(doc(db, 'admin_instructions', d.id), { status: 'active' });
    }
  }
  console.log("Done");
}
run();
