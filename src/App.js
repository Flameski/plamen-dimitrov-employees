import './App.css';
import Papa from 'papaparse';
import { useState } from 'react';
import DataRow from './DataRow';

function App() {
  const [projects, setProjects] = useState([]);

  const changeHandler = (e) => {
    try {
      Papa.parse(e.target.files[0], {
        header: false,
        skipEmptyLines: true,
        complete: displayResults,
      });
    } catch (error) {
      console.warn(error);
    }
  };

  const displayResults = ({ data }) => {
    let uniqueProjects = [];
    // get an array of all projects
    data.forEach((el) => {
      if (!uniqueProjects.includes(el[1])) {
        uniqueProjects.push(el[1]);
      }
    });
    // transform each project into an object
    uniqueProjects = uniqueProjects.map((project) => {
      return {
        projectId: project,
        participants: [],
      };
    });
    // add participants for every project
    uniqueProjects.forEach((project) => {
      data.forEach((el) => {
        if (project.projectId === el[1]) {
          project.participants.push(el[0]);
        }
      });
    });
    // add additional info template for the project
    uniqueProjects.forEach((proj) => {
      proj.participants = proj.participants.map((participant) => {
        return {
          id: participant,
          startDate: null,
          endDate: null,
        };
      });
    });

    // add dates to each participant
    uniqueProjects.forEach((proj) => {
      proj.participants.forEach((participant) => {
        data.forEach((el) => {
          if (participant.id === el[0] && proj.projectId === el[1]) {
            let startDate = new Date(el[2]);
            let endDate = new Date(el[3]);
            if (el[3] === 'NULL') {
              endDate = new Date(Date.now());
            }
            participant.startDate = startDate;
            participant.endDate = endDate;
          }
        });
      });
    });

    uniqueProjects.forEach((proj) => {
      proj.participants.forEach((participant) => {
        // check pairs of users working together
        let users = proj.participants;
        let daysWorkingTogether = null;
        let longestWorkingTogether = {
          projectId: null,
          days: null,
          firstWorker: null,
          secondWorker: null,
        };
        for (let i = 0; i < users.length; i++) {
          if (participant.id === users[i].id) {
            // same user, skip
            continue;
          }
          if (participant.endDate < users[i].startDate) {
            // second guy started after the first was finished, skipping
            continue;
          } else if (participant.startDate > users[i].endDate) {
            // first girl started after the second was finished, skipping
            continue;
          } else {
            if (
              participant.endDate.getDate() === users[i].endDate.getDate() &&
              participant.endDate.getMonth() === users[i].endDate.getMonth() &&
              participant.endDate.getFullYear() ===
                users[i].endDate.getFullYear()
            ) {
              // they are both working on a project now, checking who started first
              let startDate;
              if (participant.startDate < users[i].startDate) {
                startDate = users[i].startDate;
              } else {
                startDate = participant.startDate;
              }
              daysWorkingTogether = Math.floor(
                (participant.endDate - startDate) / 1000 / 60 / 60 / 24
              );
            } else if (participant.endDate < users[i].endDate) {
              daysWorkingTogether = Math.floor(
                (participant.endDate - users[i].startDate) / 1000 / 60 / 60 / 24
              );
            } else {
              daysWorkingTogether = Math.floor(
                (users[i].endDate - participant.startDate) / 1000 / 60 / 60 / 24
              );
            }
            // console.log(
            //   `User ${participant.id} worked with user ${users[i].id} for ${daysWorkingTogether} days on project ${proj.projectId}`
            // );
            if (daysWorkingTogether > longestWorkingTogether.days) {
              longestWorkingTogether.days = daysWorkingTogether;
              longestWorkingTogether.firstWorker = participant.id;
              longestWorkingTogether.secondWorker = users[i].id;
              longestWorkingTogether.projectId = proj.projectId;
            }
            proj.longestWorkingPair = longestWorkingTogether;
          }
        }
      });
    });
    setProjects(uniqueProjects);
  };

  return (
    <>
      <h1>Employees App</h1>
      <label htmlFor='file-upload'>
        <p>Upload file</p>
        <input
          type='file'
          name='file'
          id='file-upload'
          accept='.csv'
          onChange={changeHandler}
        />
      </label>
      {projects.length > 0 && (
        <section className='data-row' style={{ paddingTop: '2rem' }}>
          <div>Employee ID #1</div>
          <div>Employee ID #2</div>
          <div>Project ID</div>
          <div>Days worked</div>
        </section>
      )}
      {projects.map((proj) => {
        return <DataRow key={proj.projectId} proj={proj} />;
      })}
    </>
  );
}

export default App;
