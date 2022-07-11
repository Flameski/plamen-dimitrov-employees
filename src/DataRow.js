import React from 'react';

function DataRow({ proj }) {
  return (
    <section className='data-row'>
      <div> {proj.longestWorkingPair.firstWorker}</div>
      <div>{proj.longestWorkingPair.secondWorker}</div>
      <div>{proj.longestWorkingPair.projectId}</div>
      <div>{proj.longestWorkingPair.days}</div>
    </section>
  );
}

export default DataRow;
