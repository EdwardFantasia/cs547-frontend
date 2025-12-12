"use client"
import { useState, useEffect, useRef } from 'react';
import SongComp from "./SongComp";
import { Song } from "./Song";
import Script from "next/script";
import Link from 'next/link';

interface SpotifyIFrameAPI {
    createController(
        element: HTMLElement | null,
        options: {
            uri: string;
            width: string | number;
            height: string | number;
        },
        callback: (EmbedController: any) => void
    ): void;
}

declare global {
    interface Window {
        onSpotifyIframeApiReady: (IFrameAPI: SpotifyIFrameAPI) => void;
    }
}

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([])
  const [searchableSongs, setSearchableSongs] = useState<Song[]>([])
  const [error, setError] = useState(false)
  const [songChosen, setSongChosen] = useState(false)
  const [chosenSong, setChosenSong] = useState<string>("")
  const [playingSong, setPlayingSong] = useState<string>("")
  const spotifyControllerRef = useRef<any>(null)
  const [searchStarted, setSearchStarted] = useState<boolean>(false)
  const [serverAddress, setServerAddress] = useState<string>("")

  useEffect(() => { //TODO: switch fetchSearchableSongs to a method where it happens on click and gets the string from input box and then returns songs and does basically same thing
    window.onSpotifyIframeApiReady = (IFrameAPI) => {
        const element = document.getElementById('spotify-embed-iframe');
        const options = {
            width: '100%',
            height: 300,
            uri: '', 
        };

        IFrameAPI.createController(element, options, (EmbedController) => {
            // Store the controller instance globally or in component state/ref
            spotifyControllerRef.current = EmbedController;
            console.log("Spotify Embed Controller is Ready.");
        });
    };
  }, [])

  async function filterSearchable(){
    //const addressString: string = (document.getElementById("serverReference") as HTMLInputElement).value.toLowerCase()
    const inputString: string = (document.getElementById("songInput") as HTMLInputElement).value.toLowerCase()
    
    try{
        const response = await fetch(`${serverAddress}/searchSongs`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            'ngrok-skip-browser-warning': "true"
          },
          body: JSON.stringify(
              {
                search: inputString
              })
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const respJson = await response.json();
        console.log(respJson)
        setSearchStarted(true)
        setSearchableSongs(respJson)
    }
    catch (error){
      console.log(error)
      //setSongs([{"artist": "Test artist", "id": "1000", "name": "Test name"}, {"artist": "Test artist longer than last name", "id": "1000", "name": "Test name"}])
      setSongs([])
      setError(true)
    }
  }
  
  async function onClick(){
    //const addressString: string = (document.getElementById("serverReference") as HTMLInputElement).value.toLowerCase()
    const moodEl: HTMLInputElement = document.getElementById("mood") as HTMLInputElement
    let moodVal = parseInt(moodEl.value) / 100
    console.log(moodVal)
    try{
        if(songChosen){
          let response = await fetch(`${serverAddress}/adjust_mood`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              'ngrok-skip-browser-warning': "true"
            },
            body: JSON.stringify(
              {
                mood: moodVal
              })
          });
          if(!response.ok){
            throw Error("Error with getting response")
          }
          //setError(false)
          const respJson = await response.json()
          console.log(respJson)
          setSongs(respJson)
      }
      else{
        console.log("moodVal: ", moodVal)
        console.log("songId: ", chosenSong)
        if(chosenSong !== ""){
          let response = await fetch(`${serverAddress}/recommend`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'ngrok-skip-browser-warning': "true"
              },
              body: JSON.stringify(
                {
                  mood: moodVal,
                  songId: chosenSong
                })
            });
            if(!response.ok){
              throw Error("Error with getting response")
            }
            //setError(false)
            const respJson = await response.json()
            console.log(respJson)
            setSongs(respJson)
        }
        setSongChosen(true)
      }
    }
    catch (error){
      console.log(error)
      //setSongs([{"artist": "Test artist", "id": "1000", "name": "Test name"}, {"artist": "Test artist longer than last name", "id": "1000", "name": "Test name"}])
      setSongs([])
      setError(true)
    }
  }

  function onSearchableClick(songData: Song){
    console.log("song data: ", songData)
    setChosenSong(songData["track_id"])
  }

  function onPlayableClick(songData: Song){
    console.log("playable")
    spotifyControllerRef.current.loadUri(`spotify:track:${songData["track_id"]}`)
    setPlayingSong(songData["track_id"])
  }

  async function onLikeOrSkip(evt: React.MouseEvent<HTMLButtonElement>){
    //const addressString: string = (document.getElementById("serverReference") as HTMLInputElement).value.toLowerCase()
    const clickedElement = evt.target as HTMLButtonElement;
    console.log(clickedElement)
    let elId: string = clickedElement.id
    console.log(elId)
    try{
        const response = await fetch(`${serverAddress}/likeOrSkip`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            'ngrok-skip-browser-warning': "true"
          },
          body: JSON.stringify(
            {
              liked: elId,
              song: playingSong
            })
        });
        if(!response.ok){
          throw Error("Error with getting response")
        }
        //setError(false)
        const respJson = await response.json()
        console.log(respJson)
        setSongs(respJson["recommendations"])
    }
    catch (error){
      console.log(error)
      //setSongs([{"artist": "Test artist", "id": "1000", "name": "Test name"}, {"artist": "Test artist longer than last name", "id": "1000", "name": "Test name"}])
      setSongs([])
      setError(true)
    }
  }

  function onSaveAddressClick(){
    const addressString: string = (document.getElementById("serverReference") as HTMLInputElement).value.toLowerCase()
    setServerAddress(addressString)
  }

  // async function ngrokTest(){
  //   const addressString: string = (document.getElementById("serverReference") as HTMLInputElement).value.toLowerCase()
    
  //   try{
  //       const response = await fetch(`${inputString}/test`, {
  //       method: "GET",
  //       headers: {
  //           "Content-Type": "application/json",
  //           'ngrok-skip-browser-warning': "true"
  //         }
  //       });
  //       if (!response.ok) {
  //         throw new Error(`HTTP error! status: ${response.status}`);
  //       }
  //       const respJson = await response.json();
  //       console.log(respJson)
  //   }
  //   catch (error){
  //     console.log(error)
  //     //setSongs([{"artist": "Test artist", "id": "1000", "name": "Test name"}, {"artist": "Test artist longer than last name", "id": "1000", "name": "Test name"}])
  //   }
  // }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 my-auto justify-center items-center font-sans dark:bg-black">
      <Link href={"https://github.com/seungho715/CS-547-Final"}></Link>
      <p>Ensure the address to your server is correct:</p>
      <input placeholder = {serverAddress} className="outline-2 outline-offset-2 outline-solid outline-white rounded-sm my-2" id = "serverReference"></input>
      <button onClick = {() => onSaveAddressClick()} className = "outline-2 outline-offset-2 outline-solid outline-white rounded-sm cursor-pointer" id = "saveAddress">Save Address</button>
      <Script src="https://open.spotify.com/embed/iframe-api/v1" async></Script>
      <div id = "spotify-embed-iframe" ></div>
      <div id = "app-container">
        {songChosen == false &&
          <div className="flex flex-col mb-13">
            <p>Type in the name of a song you want results to sound like:</p>
            <input className="outline-2 outline-offset-2 outline-solid outline-white rounded-sm my-2" id = "songInput"></input>
            <button onClick = {() => filterSearchable()} className = "outline-2 outline-offset-2 outline-solid outline-white rounded-sm cursor-pointer my-2">Search For Songs</button>
              {searchStarted &&
                <div className="h-100 overflow-y-scroll px-[5px]">
                  {searchableSongs.map(el => {
                      return(
                        <SongComp selected = {el["track_id"] === chosenSong} cName = {"searchable"} key = {el["track_id"]} songCompClick = {() => onSearchableClick(el)} songData={el} ></SongComp>
                      )
                    })
                  }
              </div>
            }
          </div>
        }
        <div className="flex w-full items-center justify-center">
          <label className = "mr-2" htmlFor = "mood">More Lyrical</label>
          <input className = "my-2" type="range" id="mood" name="mood" min="0" max="100" defaultValue="50" step="1" />
          <label className = "ml-2" htmlFor = "mood">More BPM-Based</label>
        </div>
        <div className="flex w-full flex-wrap items-center justify-center my-2">
          <button onClick = {() => onClick()} className = "outline-2 outline-offset-2 outline-solid outline-white rounded-sm cursor-pointer" id = "submit-btn">Search for Songs Matching My Mood</button>
        </div>
        {error &&
          <div className = "flex w-full flex-wrap items-center justify-center">
            <p>There was an error retrieving your recommendations</p>
          </div>
        }
        <div className="flex items-center justify-center w-full">
          <div className="flex flex-col mx-auto h-1/2">
            {songs.map(el => {
              return(
                <SongComp key = {el["track_id"]} selected = {el["track_id"] === playingSong} cName = {"playable"} songCompClick={() => onPlayableClick(el)} songData = {el}></SongComp>
              )
            })}
          </div>
          {playingSong !== "" &&
            <div className = "flex flex-row justify-center items-center">
              <button onClick = {onLikeOrSkip} className="outline-2 outline-offset-2 outline-solid outline-white rounded-sm cursor-pointer my-2 mx-3" id = "full">Like</button>
              <button onClick = {onLikeOrSkip} className="outline-2 outline-offset-2 outline-solid outline-white rounded-sm cursor-pointer my-2" id = "skip">Skip</button>
            </div>
          }
        </div>
      </div>
    </div>
  );
}
