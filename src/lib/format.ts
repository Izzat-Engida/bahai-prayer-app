export const formatTime=(date:Date|null)=>
    date && !isNaN(date.getTime())? date.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}):'-';

export const formatHour=(hour:number,minute:number)=>formatTime(new Date(2000,0,1,hour,minute));
