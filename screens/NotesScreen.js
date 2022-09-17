import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import firebase from "../database/firebaseDB";

export default function NotesScreen({ navigation, route }) {
  const [notes, setNotes] = useState([]);
  const db = firebase.firestore().collection("todos");

   // When the screen loads, we start monitoring Firebase
   useEffect(() => {
    const unsubscribe = db.orderBy("created").onSnapshot((collection) => {
      const updatedNotes = collection.docs.map((doc) => {
        // create our own object that pulls the ID into a property
        const noteObject = {
          ...doc.data(),
          id: doc.id,
        };
        console.log(noteObject);
        return noteObject;
      });
      setNotes(updatedNotes);
    });

    return unsubscribe; // return the cleanup function
  }, []);

  // This is to set up the top right button
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={addNote}>
          <Ionicons
            name="ios-create-outline"
            size={30}
            color="black"
            style={{
              color: "#f55",
              marginRight: 10,
            }}
          />
        </TouchableOpacity>
      ),
    });
  });

  // Monitor route.params for changes and add items to the database
  useEffect(() => {
    if (route.params?.text) {
      const newNote = {
        title: route.params.text,
        done: false, // no more id line!
        created: firebase.firestore.FieldValue.serverTimestamp(),
        // alternative:
        // created: Date.now().toString(),
      };
      db.add(newNote);
    }
  }, [route.params?.text]);

  function addNote() {
    navigation.navigate("Add Screen");
  }

  // This deletes an individual note
  function deleteNote(id) {
    console.log("Deleting " + id);
    db.doc(id).delete(); // this is much simpler now we have the Firestore ID
  }

  const [state, setState] = useState({
    isVisible: false,
  });

  const [text, setText] = useState("");

  function editNote(id) {
    db.doc(id).update({ title: text });
  }

  // hide show modal	
      function displayModal(show) {	
        setState({ isVisible: show });	
      }

  // The function to render each row in our FlatList
  function renderItem({ item }) {
    return (
      <View
        style={{
          padding: 10,
          paddingTop: 20,
          paddingBottom: 20,
          borderBottomColor: "#ccc",
          borderBottomWidth: 1,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >

<Modal
  animationType={"slide"}
  transparent={false}
  visible={state.isVisible}
  onRequestClose={() => {
    Alert.alert("Modal has now been closed.");
  }}
>


  <View style={styles.modal}>
    <Text style={styles.text}>Edit your note!</Text>
    <TextInput
      style={styles.textInput}
      // value={item.title}
      onChangeText={(input) => setText(input)}
    />
    <View style={{ flexDirection: "row" }}>
      <TouchableOpacity
        style={styles.saveButton}
        onPress={() => {
          editNote(item.id), displayModal(!state.isVisible);
        }}
      >
        <Text style={styles.buttonText}>Edit</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => displayModal(!state.isVisible)}
      >
        <Text style={styles.buttonText}>Dimiss</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>


        <Text>{item.title}</Text>
        <TouchableOpacity onPress={() => deleteNote(item.id)}>
          <Ionicons name="trash" size={16} color="#944" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notes}
        renderItem={renderItem}
        style={{ width: "100%" }}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffc",
    alignItems: "center",
    justifyContent: "center",
  },

  modal: {
    flex: 1,
    backgroundColor: "#ffc",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {	
    fontSize: 24,	
    marginBottom: 20,	
    textAlign: "center",	
  },	
  closeText: {	
    fontSize: 24,	
    color: "#00479e",	
    textAlign: "center",	
  },	
  textInput: {	
    borderColor: "grey",	
    borderWidth: 1,	
    width: "80%",	
    padding: 10,	
    margin: 20,	
    fontSize: 20,	
  },	
  saveButton: {	
    padding: 10,	
    backgroundColor: "#42F74C",	
    borderRadius: 5,	
    margin: 20,	
    marginTop: 20,	
    paddingHorizontal: 20,	
  },	
  cancelButton: {	
    padding: 10,	
    backgroundColor: "#F74242",	
    borderRadius: 5,	
    margin: 20,	
    marginTop: 20,	
    paddingHorizontal: 20,	
  },	
  buttonText: {	
    textAlign: "center",	
    fontSize: 20,	
  },
});
