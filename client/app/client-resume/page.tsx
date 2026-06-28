"use client";

import { useEffect, useState } from "react";
import { getResume } from "../../services/resume.services";


export default function ResumeViewer(){

const [url,setUrl] = useState<string | null>(null);


useEffect(()=>{

  async function load(){

    const resume = await getResume();

    setUrl(resume);

  }

  load();

},[]);



if(!url){

return (
<div className="p-10">
No resume available
</div>
)

}


return (

<div className="min-h-screen bg-gray-900 p-5">


<h1 className="text-white text-2xl mb-5">
Resume
</h1>


<iframe
src={url}
className="w-full h-[90vh] bg-white"
/>


</div>

)

}