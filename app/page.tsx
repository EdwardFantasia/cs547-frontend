"use client"
import Image from "next/image";
import Link from 'next/link'
import { useState } from 'react';
import SongComp from "./SongComp";
import { Song } from "./Song";

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([])
  const [searchedSongs, setSearchedSongs] = useState<Song[]>([])
  const [error, setError] = useState(false)
  let initSongSent = false
  
  async function onClick(){
    const moodEl = document.getElementById("mood") as any
    let moodVal = moodEl.value / 100
    console.log(moodVal)
    try{
        const response = await fetch("http://localhost:5000/process_data", {
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
        setError(false)
        const respJson = await response.json()
        console.log(respJson)
        //TODO: setSongs(respJson.body.songs)
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
      <div className="flex flex-col mb-13">
        <p>What song would you like recommended songs to sound like?</p>
        <input id = "songInput"></input>
        <button></button>
        <div>

        </div>
      </div>
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
              <SongComp id = {el.id} name = {el.name} artist = {el.artist}></SongComp>
            )
          })}
        </div>
      </div>
    </div>
  );
}
