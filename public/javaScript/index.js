
let  newSong=new Audio();

let range=document.querySelector('#range-mugic');
let ShowCurrentTime=document.querySelector('.show-current-time') ;
let ShowDurationTime=document.querySelector('.show-duration-time');
playButton=document.querySelector('.play');
backwardButton=document.querySelector('.backward');
forwardButton=document.querySelector('.forward');
let playb=document.querySelector('.play-song')
let playIcon=document.querySelector('.play')
let play=false;

//Select Play Song...........
let mugics=document.querySelectorAll('.mugicContainer')
    Array.from(mugics).forEach((e,index)=>{
      e.addEventListener('click',()=>{
         song=document.querySelectorAll('.mugic-src')[index].innerText;
         playb.classList.remove('fa-circle-pause');
         playb.classList.add('fa-circle-play');
         playb=document.querySelectorAll('.play-song')[index]
         newSong.pause();

         playb.classList.remove('fa-circle-play');
         playb.classList.add('fa-circle-pause');
      
         newSong.src=song;       
         audioPlay(newSong);
         if(play){
          playIcon.classList.remove('fa-circle-play');
          playIcon.classList.add('fa-circle-pause');
        }
        else{
        playIcon.classList.remove('fa-circle-pause');
              playIcon.classList.add('fa-circle-play');
        }
      })
  })

  
//Control Buttons
playButton.addEventListener('click',()=>{
    if(play){
      newSong.pause();
     
      play=false;
    }
    else{
      audioPlay(newSong)
      
    }
    if(play){
      playIcon.classList.remove('fa-circle-play');
      playIcon.classList.add('fa-circle-pause');
    }
    else{
    playIcon.classList.remove('fa-circle-pause');
    playIcon.classList.add('fa-circle-play');
    }
})

backwardButton.addEventListener('click',()=>{
  newSong.currentTime=newSong.currentTime-10;
})
forwardButton.addEventListener('click',()=>{
  newSong.currentTime=newSong.currentTime+10;
})

function audioPlay(newSong){
  newSong.play();
  play=true;
}
//update Range value
range.addEventListener('change',async()=>{
  newSong.currentTime= await (range.value*newSong.duration)/6000;
})

//Set Time Update of Current play Song
newSong.addEventListener('timeupdate',()=>{
  let currentTime=Math.floor(newSong.currentTime);
  let DurationTime=Math.floor(newSong.duration);

  //Set Range Value

  range.value=(newSong.currentTime/newSong.duration)*6000;

   
  //Current Time Set..............
  if( currentTime<60){
    if(currentTime<10){
      ShowCurrentTime.innerText=`00:0${Math.floor(newSong.currentTime)}`;
    }
    else{
      ShowCurrentTime.innerText=`00:${Math.floor(newSong.currentTime)}`;
    }
  }
  else{
       minit=currentTime/60;
       second=currentTime%60;
       if(minit<10){
        if(second<10){
          ShowCurrentTime.innerText=`0${Math.floor(minit)}:0${Math.floor(second)}`;
        }
        else{
          ShowCurrentTime.innerText=`0${Math.floor(minit)}:${Math.floor(second)}`;
        }
       }
       else{
        if(second<10){
          ShowCurrentTime.innerText=`${Math.floor(minit)}:0${Math.floor(second)}`;
        }
        else{
          ShowCurrentTime.innerText=`${Math.floor(minit)}:${Math.floor(second)}`;
        }
       }     
  }

  //Duration Time Set............
   if(DurationTime<60){
      if(DurationTime<10){
        ShowCurrentTime.innerText=`00:0${Math.floor(newSong.currentTime)}`;
      }
      else{
        ShowCurrentTime.innerText=`00:${Math.floor(newSong.currentTime)}`;
      }
    }
    else{
       minit=DurationTime/60;
       second=DurationTime%60;
       if(minit<10){
        if(second<10){
          ShowDurationTime.innerText=`0${Math.floor(minit)}:0${Math.floor(second)}`;
        }
        else{
          ShowDurationTime.innerText=`0${Math.floor(minit)}:${Math.floor(second)}`;
        }
       }
       else{
        if(second<10){
          ShowDurationTime.innerText=`${Math.floor(minit)}:0${Math.floor(second)}`;
        }
        else{
          ShowDurationTime.innerText=`${Math.floor(minit)}:${Math.floor(second)}`;
        }
       }     
   }
})

