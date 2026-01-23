'use strict';

async function getUuid() {
    console.log("Steven");
    await fetch('/api/uuid', {method: "POST", credentials: "include"});
}

getUuid().then(data => {    console.log("Stevenedge");
                            //console.log(data);
                            console.log("Done")});