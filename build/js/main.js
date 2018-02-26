(function(){

    function getInnerJson(data){
        return(
            `<ul class="sub-list">        
                ${data.workers.map(worker=>{
                    return(
                        `<li class="sub-list__item parent-item">
                            <p>${worker.name}</p>
                            <p class="full-screen__item__sub-text">${worker.region}</p>
                            ${worker.workers ? getInnerJson(worker) : 'end'}
                        </li>`
                        )
                    })
                }
            </ul>`
        )
    } 
    
    
    function jsonParseMenu(elem,id,data) {
        var obj = document.createElement(elem);
        for(var i=0;i<data.length;i++){
            obj.innerHTML += 
                `<li class="sub-list__item parent-item">
                    <p>  ${data[i].name}  </p>
                    <p class="full-screen__item__sub-text">${data[i].region}</p>
                    <ul class="sub-list">     
                        ${data[i].workers.map(worker=>{
                            return(
                                `<li class="sub-list__item parent-item">
                                    <p>${worker.name}</p>
                                    <p class="full-screen__item__sub-text">${worker.region}</p>
                                    ${worker.workers ? getInnerJson(worker) : 'end'}
                                </li>`
                                )
                            })
                        }
                    </ul>
                </li>`
            };
            return obj;
    }
    
    
    window.onload = function(){
        let breadCrumsWrap = document.querySelector('.breadcrums');
        let menu = document.querySelector('.full-screen');
        for(breadCrum in breadCrums){
            breadCrumsWrap.innerHTML += `<li class="breadcrums__item">${breadCrums[breadCrum]}</li>`;
        }
        
        menu.appendChild(jsonParseMenu("Ul","#m",data));//Вставка меню

    }


})()