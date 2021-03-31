import React, {Fragment} from "react";
import "./App.css";
import MainForm from "./MainForm";
import {getInstance} from "d2";
import {Switch, Route} from "react-router-dom";


//authentication for the namis api
//const basicAuth = "Basic " + btoa("ahmed:Atwabi@20");

function App() {

  const [programs, setPrograms]= React.useState([]);
  const [D2, setD2] = React.useState();

  //initializing an array-to-tree library that will turn an array of org units into a tree form
  var arrayToTree = require("array-to-tree");

  React.useEffect(() => {

    getInstance().then((d2) => {
      setD2(d2);
      const endpoint = "programs.json?paging=false";
      const unitEndpoint = "organisationUnits.json?paging=false&fields=name&fields=level&fields=id&fields=parent";
      const marketsEndPoint = "organisationUnitGroups/Lp9RVPodv0V.json?fields=organisationUnits[id,name,level,ancestors[id,name,level,parent]]";
      d2.Api.getApi().get(endpoint)
          .then((response) => {
            //console.log(response.programs);

            const tempArray = []
            response.programs.map((item, index) => {
                if(item.displayName.includes("APES: Form 1")){
                    tempArray.push({"id" : item.id, "label" : item.displayName});
                }
            });
            setPrograms(tempArray);
          })
          .catch((error) => {
            console.log(error);
            alert("An error occurred: " + error);
          });

    });

  }, [arrayToTree])


  return (
      <Fragment>
        <Switch>
          <Route path="/"  render={(props) => (
              <MainForm {...props}
                        d2={D2}
                        programs={programs}/>
          )} exact/>
        </Switch>
      </Fragment>
  );
}

export default App;