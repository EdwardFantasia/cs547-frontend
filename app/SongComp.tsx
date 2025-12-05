import { Song } from "./Song"

export default function SongComp(songData: Song){
    function songCompClick(){
        //TODO: go to spotify page for song OR yt search song if spotify API is being annoying
    }

    return (
        <div className = "flex flex-col justify-center items-center mx-auto outline-2 outline-offset-2 outline-solid outline-white rounded-sm cursor-pointer my-2" onClick = {() => songCompClick()}>
            <p>Song Title: {songData.name}</p>
            <p>Artist: {songData.artist}</p>
        </div>
    )
}