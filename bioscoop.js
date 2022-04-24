async function fetchBioscoop() {
  let bioscopen;

  let url__bioscopen = `https://opendata.bruxelles.be/api/records/1.0/search/?dataset=bioscopen&q=`;

  let resp = await fetch(url__bioscopen);
  if (!resp.ok) {
    console.log("Ophalen van data is mislukt");
    return;
  }

  const data = await resp.json();
  bioscopen = data.records;

  return bioscopen;
}
