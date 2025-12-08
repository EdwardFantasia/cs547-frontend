import { Song } from "./Song"

export default function SongComp({selected, songData, songCompClick, cName}: {songData: Song, songCompClick: () => void, cName: string, selected: boolean}){
    return (
        <div id = {songData["track_id"]} className = {`${cName} ${selected ? "selected" : ""} flex flex-col justify-center items-center mx-auto outline-2 outline-offset-2 outline-solid outline-white rounded-sm cursor-pointer my-2`} onClick = {() => songCompClick()}>
            <p>Song Title: {songData.track_name}</p>
            <p>Artist: {songData.artist_name}</p>
        </div>
    )
}