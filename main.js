(function(){

  let btnAddFolder=document.querySelector("#addFolder");
  let btnAddTextFile=document.querySelector("#addTextFile");
  let btnAddAlbum=document.querySelector("#addAlbum");  //new5
  let divbreadcrumb=document.querySelector("#breadcrumb");
  let divcontainer=document.querySelector("#container");
  let aRootPath=divbreadcrumb.querySelector("a[purpose='path']");

  
  let divApp=document.querySelector("#app");
  let divAppTitleBar=document.querySelector("#app-title-bar");
  let divAppTitle=document.querySelector("#app-title");
  let divAppMenuBar=document.querySelector("#app-menu-bar");
  let divAppBody=document.querySelector("#app-body");
  let appClose=document.querySelector("#app-close");
  

  let templates=document.querySelector("#templates");
  let resources=[];//For storing data in localStorage, and getting data from localStorage
  let cfid=-1;//Initially we are at root (which has an id of -1),it is use to identify hum kisi instant of time pae kis folder mae hai
  let rid=0;//Sabko uniqe id mil sakae isliyae rid banayae hai

  btnAddFolder.addEventListener("click",addFolder);
  btnAddTextFile.addEventListener("click",addTextFile);
  btnAddAlbum.addEventListener("click",addAlbum);   //new6
  aRootPath.addEventListener("click",viewFolderFromPath);//aRootPath pae eventListener laganae kae liyae esae write kiyae hai, kyo ki yae pahalae sae add rahata hai divbredcrumb mae, espar koi eventListener nahi laga rahta hai
  appClose.addEventListener("click",closeApp);

  
  function closeApp()
  {
    divAppTitle.innerHTML="title will come here";
    divAppTitle.setAttribute("rid","");
    divAppMenuBar.innerHTML="";
    divAppBody.innerHTML="";
  }
  

  function addFolder()
  {
    let rname=prompt("Enter folder's name:");
    //console.log(fname);

    if(rname!=null)
    {
      rname=rname.trim(); //koi agae, pichae space ho toh remove ho jaye,agar es line ko if(!rname){} kae bad write karengae toh yae space ko bhi allow kar dega  
    }


    //empty name validation     
    if(!rname)  
    {
      alert("Empty name is not allowed.");
      return;
    }

    //uniqueness validation      
    // let alreadyExists=resources.some(r => r.rname && r.pid == cfid);      OR
    let alreadyExists=resources.some(function(resource){
      if(resource.pid==cfid)
      {
        if(resource.rname==rname)
        {
          return true;
        }
      }
    });
    if(alreadyExists==true)
    {
      alert(rname+" is already in use. Try some othe name");
      return;
    }
    
    rid++;          
    let pid=cfid;    

    //HTML mae add   
    addFolderHTML(rname,rid,pid);

    //RAM mae add  ,r-->resources 
    resources.push({
      rid:rid,
      rname:rname,
      rtype:"folder",
      pid:pid
    });

    //Local Storage mae save karna hai      
    saveToStorage();

  }
  function addFolderHTML(rname,rid,pid)
  {
    
      let divFolderTemplate=templates.content.querySelector(".folder");
      let divFolder=document.importNode(divFolderTemplate,true);

      let spanRename=divFolder.querySelector("[action=rename]");
      let spanDelete=divFolder.querySelector("[action=delete]");
      let spanView=divFolder.querySelector("[action=view]");
      let divName=divFolder.querySelector("[purpose=name]");
      
      spanRename.addEventListener("click",renameFolder);
      spanDelete.addEventListener("click",deleteFolder);
      spanView.addEventListener("click",viewFolder);
      divName.innerHTML=rname;
      divFolder.setAttribute("rid",rid);
      divFolder.setAttribute("pid",pid);

      divcontainer.appendChild(divFolder);
    
  }


  function deleteFolder()
  {
    /*
      let divFolder=this.parentNode;
      let divName=divFolder.querySelector("[purpose=name]");
      console.log("In deleteFolder: ",divName.innerHTML);
    */
    //delete all folders inside also
    let spanDelete=this;
    let divFolder=spanDelete.parentNode;
    let divName=divFolder.querySelector("[purpose='name']");

    let fidTBD=parseInt(divFolder.getAttribute("rid"));
    let fname=divName.innerHTML;

    let childrenExists=resources.some(r => r.pid==fidTBD);
    let sure=confirm(`Are you sure you want to delete ${fname}?`+(childrenExists? ". It also has children.": " It not has children"));//( condition? "ifPart":"elsePart")
    if(!sure)
    {
      return;
    }

    //html sae simply divFolder ko remove, kar diyae
    divcontainer.removeChild(divFolder);

    //ram sae remove
    deleteHelper(fidTBD);//resources array mae sae, sarae children with the target folder kae corresponding object ko remove karengae
  
    //local storage sae delete
    saveToStorage();
  }
  function deleteHelper(fidTBD)
  {
    //recursion use karengae
    /*jis folder ka fidTBD hai usae delete karnae sae pahlae, sabsae pahlae uskae children delete honae chahiyae*/



    let children=resources.filter(function(r){
      if(r.pid==fidTBD)
      {
        return true;
      }
    });//sarae children esmae aa gayae,filter ho kae from main resources[] ARRAY

  //jis folder pae click kiyae thae, uskae sarae children ko delete kar diyae
    for(let i=0;i<children.length;i++)
    {
      deleteHelper(children[i].rid);//This is capable of delete of children and their children recursively
    }

  //jis folder pae click kiya gaya tha usae, delete kar diyae
    let ridx=resources.findIndex(r=>r.rid==fidTBD);
    console.log(resources[ridx].name);//console mae output show hoga
    resources.splice(ridx,1);

  }


//Types of validation:-- empty, old, unique      
  function renameFolder()
  {
    /*
      let divFolder=this.parentNode;
      let divName=divFolder.querySelector("[purpose=name]");
      console.log("In renameFolder: ",divName.innerHTML);
    */
    
      let nrname=prompt("Enter folder's name:");//nrname:-new resource name     
      if(nrname!=null) 
      {
        nrname=nrname.trim();
      }

      //empty name validation
      if(!nrname)                                
      {
        alert("Empty name is not allowed.");
        return;
      }
      
      let spanRename=this;
      let divFolder=this.parentNode;
      let divName=divFolder.querySelector("[purpose=name]");
      let orname=divName.innerHTML;
      let ridTBU=parseInt(divFolder.getAttribute("rid"));//ridTBU:-- resource id to be updated

      //old name validation
      if(nrname==orname)                        
      {
        alert("This is old file name,Please enter new name");
        return;
      }

      //uniqueness is checking
      let alreadyExists=resources.some(function(resource){
        if(resource.pid==cfid)
        {
          if(resource.rname==nrname)
          {
            return true;
          }
        }
      });
      if(alreadyExists==true)
      {
        alert(nrname+" is already in use. Try some othe name");
        return;
      }

      //change HTML
      divName.innerHTML=nrname;

      //change RAM
      let resource=resources.find(r => r.rid==ridTBU);
      resource.rname=nrname;

      //change localStorage
      saveToStorage();
  }


  function viewFolder()
  {
    /*
    let divFolder=this.parentNode;
    let divName=divFolder.querySelector("[purpose=name]");
    console.log("In viewFolder: ",divName.innerHTML);
    */

//kisi folder kae view button pae click kar rahae hai toh,1)divcontainer ka content clear ho jaa raha hai,2)usmae wo resources add ho jaa rahae hai jiska pid==cfid hai,folder kae name sae aPath divbreadcrumb mae add ho jaa raha hai,refresh karnae pae hum initial HTMl page pae chalae ja rahae hai
//Part1
    let spanView=this;
    let divFolder=spanView.parentNode;
    let divName=divFolder.querySelector("[purpose='name']");

    let fname=divName.innerHTML; //folder name
    let fid=parseInt(divFolder.getAttribute("rid"));//folder id

    //aPath container bana liyae
    let aPathTemplate=templates.content.querySelector("a[purpose='path']");
    let aPath=document.importNode(aPathTemplate,true);

    //aPath mae value set kar liyae
    aPath.innerHTML=fname;
    aPath.setAttribute("rid",fid);
    
    divbreadcrumb.appendChild(aPath);
  
    cfid=fid;

    divcontainer.innerHTML="";//removing the content of divcontainer
    //divcontainer mae, resources ko add kar rahae hai jiska "pid" is equal to "cfid"
    for(let i=0;i<resources.length;i++)
    {
      if(resources[i].pid==cfid)
      {
        
        if(resources[i].rtype=="folder")
        {
          addFolderHTML(resources[i].rname,resources[i].rid,resources[i].pid);
        }
        else if(resources[i].rtype=="text-file")
        {
          addTextFileHTML(resources[i].rname,resources[i].rid,resources[i].pid);
        }
        else if(resources[i].rtype=="album")//new19
        {
          addAlbumHTML(resources[i].rname,resources[i].rid,resources[i].pid);
        }
      }
    }
//part1

//jab hum aPath pae click karae toh,1)divcontainer ka content erase ho jayae 2)divcontainer mae wo resource load ho jayae jinka pid equal to aPath,rid kae equal ho jaaye,3)divbreadcrumb kae child delete ho jayae
//Part-2

    //aRootPath pae eventListener lagana hoga seprately,upar kar diyae hai esae
    
    aPath.addEventListener("click",viewFolderFromPath);

//part2
  }

  function viewFolderFromPath()
  {
    let aPath=this;
    let fid=parseInt(aPath.getAttribute("rid"));

    //set the breadcrumb
    /*
    while(aPath.nextSibling)//  jyda timecomplexity hai eska
    {
      aPath.parentNode.removeChild(aPath.nextSibling);//aPath ka parent,breadCrumb hai
    }
    */               
                                  //OR
    for(let i=divbreadcrumb.children.length-1;i>=0;i--)//esasae low timecomplexity hoga
    {
      if(divbreadcrumb.children[i]==aPath)
      {
        break;
      }
      divbreadcrumb.removeChild(divbreadcrumb.children[i]);
    }

    //set the container
    cfid=fid;
    divcontainer.innerHTML="";
    for(let i=0;i<resources.length;i++)
    {
      if(resources[i].pid==cfid)
      {
        
          if(resources[i].rtype=="folder")
          {
            addFolderHTML(resources[i].rname,resources[i].rid,resources[i].pid);
          }
          else if(resources[i].rtype=="text-file")
          {
            addTextFileHTML(resources[i].rname,resources[i].rid,resources[i].pid);
          }
          else if(resources[i].rtype=="album")//new20
          {
            addAlbumHTML(resources[i].rname,resources[i].rid,resources[i].pid);
          }
      }

    }
  }

  function addTextFile()
  {

    /*
      let tfname=prompt("Enter text file's name:");
      console.log(tfname);
    */

      let rname=prompt("Enter text file's name:");
      //console.log(rname);
  
      if(rname!=null)
      {
        rname=rname.trim(); //koi agae, pichae space ho toh remove ho jaye,agar es line ko if(!rname){} kae bad write karengae toh yae space ko bhi allow kar dega  
      }
  
  
      //empty name validation     
      if(!rname)  
      {
        alert("Empty name is not allowed.");
        return;
      }
  
      //uniqueness validation      
      // let alreadyExists=resources.some(r => r.rname && r.pid == cfid);      OR
      let alreadyExists=resources.some(function(resource){
        if(resource.pid==cfid)
        {
          if(resource.rname==rname)
          {
            return true;
          }
        }
      });
      if(alreadyExists==true)
      {
        alert(rname+" is already in use. Try some othe name");
        return;
      }
      
      rid++;          
      let pid=cfid;    
  
      //HTML mae add   
      addTextFileHTML(rname,rid,pid);
  //taki jab new file open ho to gandi na dekhae,esliyae kuch RAM walae part mae bhi change karengae
  

      //RAM mae add  ,r-->resources 
      resources.push({
        rid:rid,
        rname:rname,
        rtype:"text-file",
        pid:cfid,
        isBold:true ,
        isItalic:false ,
        isUnderline:false ,
        bgColor:"#0000FF" ,
        textColor:"#FFFFFF" ,
        fontFamily: "serif",
        fontSize: 12,
        content:"I am a new file."
      });
  
      //Local Storage mae save karna hai      
      saveToStorage();
  }
  function addTextFileHTML(rname,rid,pid)
  {
      let divTextFileTemplate=templates.content.querySelector(".text-file");
      let divTextFile=document.importNode(divTextFileTemplate,true);

      let spanRename=divTextFile.querySelector("[action=rename]");
      let spanDelete=divTextFile.querySelector("[action=delete]");
      let spanView=divTextFile.querySelector("[action=view]");
      let divName=divTextFile.querySelector("[purpose=name]");
      
      spanRename.addEventListener("click",renameTextFile);
      spanDelete.addEventListener("click",deleteTextFile);
      spanView.addEventListener("click",viewTextFile);
      divName.innerHTML=rname;
      divTextFile.setAttribute("rid",rid);
      divTextFile.setAttribute("pid",pid);

      divcontainer.appendChild(divTextFile);
    
  }

  //new8
  function addAlbum()
  {
      let rname=prompt("Enter album name:");//new9
      
  
      if(rname!=null)
      {
        rname=rname.trim(); //koi agae, pichae space ho toh remove ho jaye,agar es line ko if(!rname){} kae bad write karengae toh yae space ko bhi allow kar dega  
      }
  
  
      //empty name validation     
      if(!rname)  
      {
        alert("Empty name is not allowed.");
        return;
      }
  
      //uniqueness validation      
      // let alreadyExists=resources.some(r => r.rname && r.pid == cfid);      OR
      let alreadyExists=resources.some(function(resource){
        if(resource.pid==cfid)
        {
          if(resource.rname==rname)
          {
            return true;
          }
        }
      });
      if(alreadyExists==true)
      {
        alert(rname+" is already in use. Try some othe name");
        return;
      }
      
      rid++;          
      let pid=cfid;    
  
      //HTML mae add   
      addAlbumHTML(rname,rid,pid);//new10
  //taki jab new file open ho to gandi na dekhae,esliyae kuch RAM walae part mae bhi change karengae
  

      //RAM mae add  ,r-->resources //new11, unwanted things koh remove kar diyae
      resources.push({
        rid:rid,
        rname:rname,
        rtype:"album",
        pid:cfid
      });
  
      //Local Storage mae save karna hai      
      saveToStorage();
  }
  //new8
  //new12
  function addAlbumHTML(rname,rid,pid)
  {
    let divAlbumTemplate=templates.content.querySelector(".album");
    let divAlbum=document.importNode(divAlbumTemplate,true);

    let spanRename=divAlbum.querySelector("[action=rename]");
    let spanDelete=divAlbum.querySelector("[action=delete]");
    let spanView=divAlbum.querySelector("[action=view]");
    let divName=divAlbum.querySelector("[purpose=name]");
    
    spanRename.addEventListener("click",renameAlbum);
    spanDelete.addEventListener("click",deleteAlbum);
    spanView.addEventListener("click",viewAlbum);
    divName.innerHTML=rname;
    divAlbum.setAttribute("rid",rid);
    divAlbum.setAttribute("pid",pid);

    divcontainer.appendChild(divAlbum);
  }
  //new12


  function deleteTextFile()
  {
    let spanDelete=this;
    let divTextFile=spanDelete.parentNode;
    let divName=divTextFile.querySelector("[purpose='name']");

    let fidTBD=parseInt(divTextFile.getAttribute("rid"));
    let fname=divName.innerHTML;

   
    let sure=confirm(`Are you sure you want to delete ${fname}?`);
    if(!sure)
    {
      return;
    }

    //html sae simply divFolder ko remove, kar diyae
    divcontainer.removeChild(divTextFile);

    //ram sae remove
    let ridx=resources.findIndex(r=> r.rid==fidTBD);
    resources.splice(ridx,1);

    //local storage sae delete
    saveToStorage();
  }

  //new15
  function deleteAlbum()
  {
    let spanDelete=this;
    let divAlbum=spanDelete.parentNode;
    let divName=divAlbum.querySelector("[purpose='name']");

    let fidTBD=parseInt(divAlbum.getAttribute("rid"));
    let fname=divName.innerHTML;

   
    let sure=confirm(`Are you sure you want to delete ${fname}?`);
    if(!sure)
    {
      return;
    }

    //html sae simply divFolder ko remove, kar diyae
    divcontainer.removeChild(divAlbum);

    //ram sae remove
    let ridx=resources.findIndex(r=> r.rid==fidTBD);
    resources.splice(ridx,1);

    //local storage sae delete
    saveToStorage();
  }
  //new15

  function renameTextFile()
  {
    let nrname=prompt("Enter files's name:");//nrname:-new resource name     
    if(nrname!=null) 
    {
      nrname=nrname.trim();
    }

    //empty name validation
    if(!nrname)                                
    {
      alert("Empty name is not allowed.");
      return;
    }
    
    let spanRename=this;
    let divTextFile=spanRename.parentNode;
    let divName=divTextFile.querySelector("[purpose=name]");
    let orname=divName.innerHTML;
    let ridTBU=parseInt(divTextFile.getAttribute("rid"));//ridTBU:-- resource id to be updated

    //old name validation
    if(nrname==orname)                        
    {
      alert("This is old file name,Please enter new name");
      return;
    }

    //uniqueness is checking
    let alreadyExists=resources.some(function(resource){
      if(resource.pid==cfid)
      {
        if(resource.rname==nrname)
        {
          return true;
        }
      }
    });
    if(alreadyExists==true)
    {
      alert(nrname+" is already in use. Try some othe name");
      return;
    }

    //change HTML
    divName.innerHTML=nrname;

    //change RAM
    let resource=resources.find(r => r.rid==ridTBU);
    resource.rname=nrname;

    //change localStorage
    saveToStorage();    
  }

  //new16
  function renameAlbum()
  {
    let nrname=prompt("Enter files's name:");//nrname:-new resource name     
    if(nrname!=null) 
    {
      nrname=nrname.trim();
    }

    //empty name validation
    if(!nrname)                                
    {
      alert("Empty name is not allowed.");
      return;
    }
    
    let spanRename=this;
    let divAlbum=spanRename.parentNode;
    let divName=divAlbum.querySelector("[purpose=name]");
    let orname=divName.innerHTML;
    let ridTBU=parseInt(divAlbum.getAttribute("rid"));//ridTBU:-- resource id to be updated

    //old name validation
    if(nrname==orname)                        
    {
      alert("This is old file name,Please enter new name");
      return;
    }

    //uniqueness is checking
    let alreadyExists=resources.some(function(resource){
      if(resource.pid==cfid)
      {
        if(resource.rname==nrname)
        {
          return true;
        }
      }
    });
    if(alreadyExists==true)
    {
      alert(nrname+" is already in use. Try some othe name");
      return;
    }

    //change HTML
    divName.innerHTML=nrname;

    //change RAM
    let resource=resources.find(r => r.rid==ridTBU);
    resource.rname=nrname;

    //change localStorage
    saveToStorage();    
  }
  //new16

  //new17
  function viewAlbum()
  {
    let spanView=this;
    let divAlbum=spanView.parentNode;
    let divName=divAlbum.querySelector("[purpose=name]");
    let fname=divName.innerHTML;
    let fid=parseInt(divAlbum.getAttribute("rid"));


    let divAlbumMenuTemplate=templates.content.querySelector("[purpose=album-menu]");
    let divAlbumMenu=document.importNode(divAlbumMenuTemplate,true);
    divAppMenuBar.innerHTML="";//empty kar diyae
    divAppMenuBar.appendChild(divAlbumMenu);

    let divAlbumBodyTemplate=templates.content.querySelector("[purpose=album-body]");
    let divAlbumBody=document.importNode(divAlbumBodyTemplate,true);
    divAppBody.innerHTML="";
    divAppBody.appendChild(divAlbumBody);

    divAppTitle.innerHTML=fname;//jis bhi album pae click karengae, ush album ka name esmae set ho jaaega
    divAppTitle.setAttribute("rid",fid);//saveAlbum mae yae kam ayega,esi ka use karkae sarae content ko save karengae

    //new27,Add button pae kam start
    let spanAdd=divAlbumMenu.querySelector("[action=add]");
    spanAdd.addEventListener("click",addPictureToAlbum);
    //new27
  }
  //new17

  //new28
  function addPictureToAlbum()
  {
    let iurl=prompt("Enter an image url:");
    if(!iurl)
    {
      return;
    }
    let img=document.createElement("img");
    img.setAttribute("src",iurl);

    let divPictureList=divAppBody.querySelector(".picture-list");
    divPictureList.appendChild(img);

    img.addEventListener("click",showPictureInMain);
  }
  //new28

  //new29
  function showPictureInMain()
  {
    let divPictureMainImg=divAppBody.querySelector(".picture-main > img");
    divPictureMainImg.setAttribute("src",this.getAttribute("src"));

    let divPictureList=divAppBody.querySelector(".picture-list");
    console.log("divPictureList:",divPictureList);
    let imgs=divPictureList.querySelectorAll("img");
    console.log("imgs:",imgs);
    for(let i=0;i<imgs.length;i++)
    {
      imgs[i].setAttribute("pressed",false);
    }

    this.setAttribute("pressed",true);
  }
  //new29

  function viewTextFile()
  {
    let spanView=this;
    let divTextFile=spanView.parentNode;
    let divName=divTextFile.querySelector("[purpose=name]");
    let fname=divName.innerHTML;
    let fid=parseInt(divTextFile.getAttribute("rid"));


    let divNotepadMenuTemplate=templates.content.querySelector("[purpose=notepad-menu]");
    let divNotepadMenu=document.importNode(divNotepadMenuTemplate,true);
    divAppMenuBar.innerHTML="";//empty kar diyae
    divAppMenuBar.appendChild(divNotepadMenu);

    let divNotepadBodyTemplate=templates.content.querySelector("[purpose=notepad-body]");
    let divNotepadBody=document.importNode(divNotepadBodyTemplate,true);
    divAppBody.innerHTML="";
    divAppBody.appendChild(divNotepadBody);

    divAppTitle.innerHTML=fname;//jis bhi textFile pae click karengae, ush textFile ka name esmae set ho jaaega
    divAppTitle.setAttribute("rid",fid);//saveNotepad mae yae kam ayega,esi ka use karkae sarae content ko save karengae

    //divAppMenuBar mae sae es liyae nikal rahae hai kyoki bad mae template [purpose="notepad-menu"] kaa content, divAppMenuBar mae dal rahae
    let spanSave=divAppMenuBar.querySelector("[action=save]");
    let spanBold=divAppMenuBar.querySelector("[action=bold]");
    let spanItalic=divAppMenuBar.querySelector("[action=italic]");
    let spanUnderline=divAppMenuBar.querySelector("[action=underline]");
    let inputBGColor=divAppMenuBar.querySelector("[action=bg-color]");
    let inputTextColor=divAppMenuBar.querySelector("[action=fg-color]");
    let selectFontFamily=divAppMenuBar.querySelector("[action=font-family]");
    let selectFontSize=divAppMenuBar.querySelector("[action=font-size]");
    let textArea=divAppBody.querySelector("textArea");
    let spanDownload=divAppMenuBar.querySelector("[action=download]");
    let spanForUpload=divAppMenuBar.querySelector("[action=forupload]");//new2
    let inputUpload=divAppMenuBar.querySelector("[action=upload]");
    

    spanSave.addEventListener("click",saveNotepad);
    spanBold.addEventListener("click",makeNotepadBold);
    spanItalic.addEventListener("click",makeNotepadItalic);
    spanUnderline.addEventListener("click",makeNotepadUnderline);
    inputBGColor.addEventListener("change",changeNotepadBGColor);
    inputTextColor.addEventListener("change",changeNotepadTextColor);
    selectFontFamily.addEventListener("change",changeNotepadFontFamily);
    selectFontSize.addEventListener("change",changeNotepadFontSize);
    spanDownload.addEventListener("click",downloadNotepad);
     
//    spanForUpload.addEventListener("click",inputUploadEventListenerTrigger);  //my new2(1)
    
    //new2(sir)
    spanForUpload.addEventListener("click",function(){
      inputUpload.addEventListener("change",uploadNotepad);   
      inputUpload.click();
    });
    //new2(sir)

    //taki jo save kiyae hai textBody kae changeg ko resources array mae usae implement kar payae,jab text-file kae view button pae click kiya jayae
    let resource=resources.find(r => r.rid==fid);
    spanBold.setAttribute("pressed",!resource.isBold);
    spanItalic.setAttribute("pressed",!resource.isItalic);
    spanUnderline.setAttribute("pressed",!resource.isUnderline);
    inputBGColor.value=resource.bgColor;
    inputTextColor.value=resource.textColor;
    selectFontFamily.value=resource.fontFamily;
    selectFontSize.value=resource.fontSize;
    textArea.value=resource.content;//textArea mae content load ho jaega

    //jo bhi upar set kiyae hai usae text-file kae writing area mae implement karanae kae liyae nichae wala likhana padega,taki fire ho jayae
    spanBold.dispatchEvent(new Event("click"));  //dispatchEvent(), jo hum mouse button sae click kartae hai wo yae program sae click karwata hai
    spanItalic.dispatchEvent(new Event("click"));
    spanUnderline.dispatchEvent(new Event("click"));
    inputBGColor.dispatchEvent(new Event("change"));
    inputTextColor.dispatchEvent(new Event("change"));
    selectFontFamily.dispatchEvent(new Event("change"));
    selectFontSize.dispatchEvent(new Event("change"));
  }

  //my new2(2)
  /*
  function inputUploadEventListenerTrigger()
  {
    let divNotepadMenu=this.parentNode;
    let inputUpload=divNotepadMenu.querySelector("[action=upload]");        
    inputUpload.addEventListener("change",uploadNotepad);
    inputUpload.click();
  }
  */
 //my new2(2)

  function downloadNotepad()
  {
    let fid=parseInt(divAppTitle.getAttribute("rid"));
    let resource=resources.find(r => r.rid==fid);
    // console.log(resource);

    let strForDownload=JSON.stringify(resource);
    let encodedData=encodeURIComponent(strForDownload);//encodeURIComponent():-1) yae jo "strForDownload" mae jo JSON string form mae hai usae perfect URL mae convert karta hai, 2)koi bhi things URL mae dalna hoga toh usae encode karna padega,toh woh perfect URL banega
   
    let divNotepadMenu=this.parentNode;
    let aDownload=divNotepadMenu.querySelector("a[purpose=download]");
    
    aDownload.setAttribute("href","data:text/json; charset=utf-8, "+encodedData);//href mae yae value set kar rahae hai
    aDownload.setAttribute("download", resource.rname+".json");//jab file download hoga toh esi name sae hoga

    aDownload.click();
  }
  function uploadNotepad()
  {
    let file=window.event.target.files[0];//1)one file toh atleast read karega hi,

    let reader=new FileReader(); 
    
    reader.addEventListener("load",function(){
      let data=window.event.target.result;
      let resource=JSON.parse(data);
      console.log("Hi");

      let spanBold=divAppMenuBar.querySelector("[action=bold]");
      let spanItalic=divAppMenuBar.querySelector("[action=italic]");
      let spanUnderline=divAppMenuBar.querySelector("[action=underline]");
      let inputBGColor=divAppMenuBar.querySelector("[action=bg-color]");
      let inputTextColor=divAppMenuBar.querySelector("[action=fg-color]");
      let selectFontFamily=divAppMenuBar.querySelector("[action=font-family]");
      let selectFontSize=divAppMenuBar.querySelector("[action=font-size]");   
      let textArea=divAppBody.querySelector("textArea"); 

      spanBold.setAttribute("pressed",!resource.isBold);
      spanItalic.setAttribute("pressed",!resource.isItalic);
      spanUnderline.setAttribute("pressed",!resource.isUnderline);
      inputBGColor.value=resource.bgColor;
      inputTextColor.value=resource.textColor;
      selectFontFamily.value=resource.fontFamily;
      selectFontSize.value=resource.fontSize;
      textArea.value=resource.content;

      spanBold.dispatchEvent(new Event("click"));
      spanItalic.dispatchEvent(new Event("click"));
      spanUnderline.dispatchEvent(new Event("click"));
      inputBGColor.dispatchEvent(new Event("change"));
      inputTextColor.dispatchEvent(new Event("change"));
      selectFontFamily.dispatchEvent(new Event("change"));
      selectFontSize.dispatchEvent(new Event("change"));


    });//"reader.addEventListener("load",function(){});" ko eskae "reader.readAsText(file)" kae upar likhana hota hai ,kyoki hamae batana hota hai ki file read karkae kaha load karna hai, toh upar likhanae sae es line "reader.readAsText(file)" ko pata chal jata hai ki file read karkae kaha load karna hai

    reader.readAsText(file);//file koh as Text read karega,jab complete read kar lega,then upar wala "reader.addEventListener("load",function(){});" call ho jaega and uskae andar kae callback function mae content pass kar dega,and callbackfunction koh call kar dega
  }


  function saveNotepad()
  {
    let fid=parseInt(divAppTitle.getAttribute("rid"));
    let resource=resources.find(r => r.rid==fid);

    let spanBold=divAppMenuBar.querySelector("[action=bold]");
    let spanItalic=divAppMenuBar.querySelector("[action=italic]");
    let spanUnderline=divAppMenuBar.querySelector("[action=underline]");
    let inputBGColor=divAppMenuBar.querySelector("[action=bg-color]");
    let inputTextColor=divAppMenuBar.querySelector("[action=fg-color]");
    let selectFontFamily=divAppMenuBar.querySelector("[action=font-family]");
    let selectFontSize=divAppMenuBar.querySelector("[action=font-size]");
    let textArea=divAppBody.querySelector("textArea");

    resource.isBold=spanBold.getAttribute("pressed") == "true";
    resource.isItalic=spanItalic.getAttribute("pressed") == "true";
    resource.isUnderline=spanUnderline.getAttribute("pressed") == "true";
    resource.bgColor=inputBGColor.value;
    resource.textColor=inputTextColor.value;
    resource.fontFamily=selectFontFamily.value;
    resource.fontSize=selectFontSize.value;  
    resource.content=textArea.value;

    saveToStorage();
    }

  function makeNotepadBold()
  {
    let textArea=divAppBody.querySelector("textArea");
    let isPressed=this.getAttribute("pressed")=="true";
    if(isPressed==false)
    {
      this.setAttribute("pressed",true);
      textArea.style.fontWeight="bold";
    }
    else
    {
      this.setAttribute("pressed",false);
      textArea.style.fontWeight="normal";
    }
  }
  function makeNotepadItalic()
  {
    let textArea=divAppBody.querySelector("textArea");
    let isPressed=this.getAttribute("pressed")=="true";
    if(isPressed==false)
    {
      this.setAttribute("pressed",true);
      textArea.style.fontStyle="italic";
    }
    else
    {
      this.setAttribute("pressed",false);
      textArea.style.fontStyle="normal";
    }
  }
  function makeNotepadUnderline()
  {
    let textArea=divAppBody.querySelector("textArea");
    let isPressed=this.getAttribute("pressed")=="true";
    if(isPressed==false)
    {
      this.setAttribute("pressed",true);
      textArea.style.textDecoration="underline";
    }
    else
    {
      this.setAttribute("pressed",false);
      textArea.style.textDecoration="none";
    }
  }
  function changeNotepadBGColor()
  {
    let color=this.value;//esasae color choose ho gaya
    let textArea=divAppBody.querySelector("textArea");
    textArea.style.backgroundColor=color;
  }
  function changeNotepadTextColor()
  {
    let color=this.value;//esasae color choose ho gaya
    let textArea=divAppBody.querySelector("textArea");
    textArea.style.color=color;
  }
  function changeNotepadFontFamily()
  {
    let fontFamily=this.value;
    let textArea=divAppBody.querySelector("textArea");
    textArea.style.fontFamily=fontFamily;
  }
  function changeNotepadFontSize()
  {
    let fontSize=this.value;
    let textArea=divAppBody.querySelector("textArea");
    textArea.style.fontSize=fontSize+"px";
  }
  
  
  function saveToStorage()
  {
    
    let rjson=JSON.stringify(resources); //used to convert any jso(javascript object) to a json string which can be saved
    localStorage.setItem("data",rjson);
    
  }
  function loadFromStorage()
  {
    
    let rjson=localStorage.getItem("data");
    if(!rjson)
    {
      return;
    }

    resources=JSON.parse(rjson);
    for(let i=0;i<resources.length;i++)
    {
      if(resources[i].pid==cfid)
      {
        //folder,text file ko alag-alag function kae use sae HTML page pae show karengae
          if(resources[i].rtype=="folder")
          {
            addFolderHTML(resources[i].rname,resources[i].rid,resources[i].pid);
          }
          else if(resources[i].rtype=="text-file")
          {
            addTextFileHTML(resources[i].rname,resources[i].rid,resources[i].pid);
          }
          else if(resources[i].rtype=="album")//new14
          {
            addAlbumHTML(resources[i].rname,resources[i].rid,resources[i].pid);
          }
        
      }
  
      if(resources[i].rid>rid)
      {
        rid=resources[i].rid;
      }
    }
  }
  loadFromStorage();


})();