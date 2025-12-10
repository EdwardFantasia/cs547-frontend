"use client"
import Image from "next/image";
import Link from 'next/link'
import { useState, useEffect } from 'react';
import SongComp from "./SongComp";
import { Song } from "./Song";
import Script from "next/script";

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
  const [fullSearchableSongs, setFullSearchableSongs] = useState<Song[]>([])
  const [searchableSongs, setSearchableSongs] = useState<Song[]>([])
  const [error, setError] = useState(false)
  const [songChosen, setSongChosen] = useState(false)
  const [chosenSong, setChosenSong] = useState<string>("")
  const [playingSong, setPlayingSong] = useState<string>("")
  let spotifyController = null

  useEffect(() => {
    const fetchSearchableSongs = async () => {
      try {
        const response = await fetch("http://localhost:5000/getSongs", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const respJson = await response.json();
        console.log(respJson)
        setFullSearchableSongs(respJson)
        setSearchableSongs(respJson)
      } catch (err) {
        //setSongs([{"artist": "Test artist", "id": "1000", "name": "Test name"}, {"artist": "Test artist longer than last name", "id": "1000", "name": "Test name"}])
        setError(true);
      }
    };

    fetchSearchableSongs();

    // This function is defined ONCE in your main component/script
    window.onSpotifyIframeApiReady = (IFrameAPI) => {
        const element = document.getElementById('spotify-embed-iframe');
        const options = {
            width: '100%',
            height: 300,
            uri: 'spotify:track:5SuOikwiRyPMVoIQDJUgSV', 
        };

        // Create the controller ONCE
        IFrameAPI.createController(element, options, (EmbedController) => {
            // Store the controller instance globally or in component state/ref
            spotifyController = EmbedController; 
            console.log("Spotify Embed Controller is Ready.");
        });
    };
  }, [])

  function filterSearchable(){
    const inputString: string = (document.getElementById("songInput") as HTMLInputElement).value.toLowerCase()
    fullSearchableSongs.filter(song => song.artist_name.toLowerCase() === inputString || song.track_name.toLowerCase() === inputString)
  }
  
  async function onClick(){
    const moodEl: HTMLInputElement = document.getElementById("mood") as HTMLInputElement
    let moodVal = parseInt(moodEl.value) / 100
    console.log(moodVal)
    try{
        if(songChosen){
          let response = await fetch("http://localhost:5000/adjust_mood", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
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
          setSongs(respJson["recommendations"])
      }
      else{
        console.log("moodVal: ", moodVal)
        console.log("songId: ", chosenSong)
        if(chosenSong !== ""){
          let response = await fetch("http://localhost:5000/recommend", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
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
            setSongs(respJson["recommendations"])
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
    setPlayingSong(songData["track_id"])
    

  }

  async function onLikeOrSkip(evt: React.MouseEvent<HTMLButtonElement>){
    const clickedElement = evt.target as HTMLButtonElement;
    console.log(clickedElement)
    let elId: string = clickedElement.id
    console.log(elId)
    try{
        const response = await fetch("http://localhost:5000/feedback", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            {
              likeOrSkip: elId,
              trackIndex: playingSong
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

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 my-auto justify-center items-center font-sans dark:bg-black">
      <Script src="https://open.spotify.com/embed/iframe-api/v1" async></Script>
      <div id = "spotify-embed-iframe"></div>
      {fullSearchableSongs.length != 0 &&
      <div id = "app-container">
        {songChosen == false &&
          <div className="flex flex-col mb-13">
            <p>What song would you like recommended songs to sound like?</p>
            <input className="outline-2 outline-offset-2 outline-solid outline-white rounded-sm my-2" id = "songInput"></input>
            <button onClick = {() => filterSearchable()} className = "outline-2 outline-offset-2 outline-solid outline-white rounded-sm cursor-pointer my-2">Search For Song</button>
              <div className="h-100 overflow-y-scroll px-[5px]">
              {searchableSongs.map(el => {
                  return(
                    <SongComp selected = {el["track_id"] === chosenSong} cName = {"searchable"} key = {el["track_id"]} songCompClick = {() => onSearchableClick(el)} songData={el} ></SongComp>
                  )
                })
              }
            </div>
          </div>
        }
        <div className="flex w-full items-center justify-center">
          <label className = "mr-2" htmlFor = "mood">Sad / Less Energetic</label>
          <input className = "my-2" type="range" id="mood" name="mood" min="0" max="100" defaultValue="50" step="1" />
          <label className = "ml-2" htmlFor = "mood">Happy / More Energetic</label>
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
              <button onClick = {onLikeOrSkip} className="outline-2 outline-offset-2 outline-solid outline-white rounded-sm cursor-pointer my-2 mx-3" id = "like">Like</button>
              <button onClick = {onLikeOrSkip} className="outline-2 outline-offset-2 outline-solid outline-white rounded-sm cursor-pointer my-2" id = "skip">Skip</button>
            </div>
          }
        </div>
      </div>
    }
    </div>
  );
}
