// Song interface
export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  previewUrl?: string;
  artworkUrl?: string;
  appleMusicUrl?: string;
}

// Default suggested songs with real Apple Music data
export const SUGGESTED_SONGS: Song[] = [
  {
    id: "1440718218",
    title: "Higher",
    artist: "Creed",
    album: "Greatest Hits",
    duration: 326293,
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/61/9e/a3/619ea37d-b1dd-fa44-b8f1-2be65635e99c/mzaf_15935885582505549683.plus.aac.p.m4a",
    artworkUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/d5/b4/ef/d5b4ef8a-a68f-223b-df91-16294395ffce/00601501410321.rgb.jpg/300x300bb.jpg",
    appleMusicUrl:
      "https://music.apple.com/us/album/higher/1440717897?i=1440718218",
  },
  {
    id: "1658644941",
    title: "Dream On",
    artist: "Aerosmith",
    album: "Aerosmith",
    duration: 267597,
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/21/a8/d2/21a8d2e0-bbf0-2438-d379-081bb2d7bb8c/mzaf_3553851117838477367.plus.aac.p.m4a",
    artworkUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/e2/87/d9/e287d987-7b92-7749-737f-b5b8a6913f88/22UM1IM38560.rgb.jpg/300x300bb.jpg",
    appleMusicUrl:
      "https://music.apple.com/us/album/dream-on/1658644936?i=1658644941",
  },
  {
    id: "1767078696",
    title: "Dancing With Myself (EP Version)",
    artist: "Billy Idol & Generation X",
    album: "Greatest Hits",
    duration: 290427,
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/3d/f5/34/3df53421-d674-cab7-5040-3119e06c83a3/mzaf_15221588861859594046.plus.aac.p.m4a",
    artworkUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/d0/8f/53/d08f535b-f04d-e683-476a-835efc05bf74/13UABIM74016.rgb.jpg/300x300bb.jpg",
    appleMusicUrl:
      "https://music.apple.com/us/album/dancing-with-myself-ep-version/1767078693?i=1767078696",
  },
  {
    id: "1667053186",
    title: "The Thrill",
    artist: "Wiz Khalifa & Empire Of The Sun",
    album: "The Thrill - Single",
    duration: 234812,
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview113/v4/1b/25/fa/1b25fa37-ad20-d02d-485c-38661275b089/mzaf_12942309211962630056.plus.aac.p.m4a",
    artworkUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Music123/v4/f5/b8/01/f5b801bb-ac60-149e-4a63-8c498c43cf5a/192641636165.jpg/300x300bb.jpg",
    appleMusicUrl:
      "https://music.apple.com/us/album/the-thrill/1667052914?i=1667053186",
  },
  {
    id: "1027465608",
    title: "Where Is My Mind? (2007 Remaster)",
    artist: "Pixies",
    album: "Surfer Rosa (2007 Remaster)",
    duration: 234973,
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/f2/94/56/f2945690-8739-02b1-86da-034f98db1c8b/mzaf_13477163061266397683.plus.aac.p.m4a",
    artworkUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/68/b7/c0/68b7c018-dc15-f44a-2611-be10237fc9a5/652637080308.png/300x300bb.jpg",
    appleMusicUrl:
      "https://music.apple.com/us/album/where-is-my-mind-2007-remaster/1027465077?i=1027465608",
  },
  {
    id: "1469577741",
    title: "Upside Down",
    artist: "Jack Johnson",
    album:
      "Jack Johnson and Friends: Sing-A-Longs and Lullabies for the Film Curious George",
    duration: 208643,
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/54/3b/02/543b02a0-c567-7787-4ea1-c56aa282631a/mzaf_5094094558437262237.plus.aac.p.m4a",
    artworkUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/08/11/d2/0811d2b3-b4d5-dc22-1107-3625511844b5/00602537869770.rgb.jpg/300x300bb.jpg",
    appleMusicUrl:
      "https://music.apple.com/us/album/upside-down/1469577723?i=1469577741",
  },
  {
    id: "1440783764",
    title: "Lithium",
    artist: "Nirvana",
    album: "Nevermind",
    duration: 257048,
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/9e/50/da/9e50da93-eaeb-7f1f-4b7b-2f571ee5ea5e/mzaf_5211214176058454055.plus.aac.p.m4a",
    artworkUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/95/fd/b9/95fdb9b2-6d2b-92a6-97f2-51c1a6d77f1a/00602527874609.rgb.jpg/300x300bb.jpg",
    appleMusicUrl:
      "https://music.apple.com/us/album/lithium/1440783617?i=1440783764",
  },
  {
    id: "362133505",
    title: "Everlong",
    artist: "Foo Fighters",
    album: "The Colour And The Shape",
    duration: 250547,
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/f9/52/85/f95285cb-0082-0798-f54e-e20497e4b898/mzaf_11341140176972938289.plus.aac.p.m4a",
    artworkUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/68/f5/86/68f586ca-a375-9965-a864-9e227e77ef5b/884977570328.jpg/300x300bb.jpg",
    appleMusicUrl:
      "https://music.apple.com/us/album/everlong/362133451?i=362133505",
  },
  {
    id: "1440735263",
    title: "Linger",
    artist: "The Cranberries",
    album: "Stars: The Best of the Cranberries 1992-2002",
    duration: 274773,
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/73/8e/19/738e1962-54b3-ea2f-6f79-7a96af6af915/mzaf_8927549570499974257.plus.aac.p.m4a",
    artworkUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/b6/c8/85/b6c885de-fde6-d40d-c95a-d89ede4270ae/06UMGIM09433.rgb.jpg/300x300bb.jpg",
    appleMusicUrl:
      "https://music.apple.com/us/album/linger/1440735255?i=1440735263",
  },
  {
    id: "997914096",
    title: "Space Song",
    artist: "Beach House",
    album: "Depression Cherry",
    duration: 320467,
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/4b/1d/64/4b1d6431-295b-2683-d180-cf3cba4eb943/mzaf_10508096473229016789.plus.aac.p.m4a",
    artworkUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/09/e0/d5/09e0d559-0682-f0f0-5e0c-3cd11e3114fd/beachhouse_depressioncherry_2400_300.jpg/300x300bb.jpg",
    appleMusicUrl:
      "https://music.apple.com/us/album/space-song/997913392?i=997914096",
  },
  {
    id: "1440891171",
    title: "Mr. Brightside",
    artist: "The Killers",
    album: "Direct Hits",
    duration: 223973,
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/b3/95/6e/b3956e14-35f0-937e-afb0-72774d3f613f/mzaf_8359343604382181711.plus.aac.p.m4a",
    artworkUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/11/64/9c/11649c80-2066-dba8-77a9-df7eecae26c1/17UM1IM06937.rgb.jpg/300x300bb.jpg",
    appleMusicUrl:
      "https://music.apple.com/us/album/mr-brightside/1440891166?i=1440891171",
  },
  {
    id: "1440879551",
    title: "Say It Ain't So",
    artist: "Weezer",
    album: "Weezer",
    duration: 258853,
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/11/23/6f/11236f0d-9b5a-b780-5ebb-56c1dc512e3a/mzaf_11156035496161349512.plus.aac.p.m4a",
    artworkUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/d0/16/da/d016da24-577e-b584-3a5a-116efb5ca362/16UMGIM52971.rgb.jpg/300x300bb.jpg",
    appleMusicUrl:
      "https://music.apple.com/us/album/say-it-aint-so/1440878798?i=1440879551",
  },
  {
    id: "635791802",
    title: "Take It Easy",
    artist: "Eagles",
    album: "Eagles",
    duration: 211579,
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/84/f6/86/84f686a9-6b79-668a-c182-e8d816ff3687/mzaf_12814377987078818013.plus.aac.p.m4a",
    artworkUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/8f/e7/f4/8fe7f417-d464-8879-b00e-3d4965a9cfd1/075596062329.jpg/300x300bb.jpg",
    appleMusicUrl:
      "https://music.apple.com/us/album/take-it-easy/635791801?i=635791802",
  },
  {
    id: "186204315",
    title: "Teenage Dirtbag",
    artist: "Wheatus",
    album: "Songs From Dawson's Creek, Vol. II",
    duration: 241667,
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/98/dc/70/98dc702d-0b43-210b-16cc-3592ab7f9433/mzaf_11197352108076948641.plus.aac.p.m4a",
    artworkUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/3b/60/46/3b604692-e7e2-f35f-01e2-4dd66e4eaf63/074648514922.jpg/300x300bb.jpg",
    appleMusicUrl:
      "https://music.apple.com/us/album/teenage-dirtbag/186203414?i=186204315",
  },
  {
    id: "1440815872",
    title: "Baba O'Riley",
    artist: "The Who",
    album: "Who's Next (Bonus Track Version)",
    duration: 299876,
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/fa/1a/53/fa1a5312-7f06-95e6-ebcb-582ed3ee82ff/mzaf_11529754895597801709.plus.aac.p.m4a",
    artworkUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/4e/d5/19/4ed519ca-3f8b-65ee-eb21-89d5c6a0b44e/00602547140265.rgb.jpg/300x300bb.jpg",
    appleMusicUrl:
      "https://music.apple.com/us/album/baba-oriley/1440815866?i=1440815872",
  },
];
