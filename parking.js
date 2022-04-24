async function fetchParking() {
  let parkings;

  let url__parkings = `https://opendata.bruxelles.be/api/records/1.0/search/?dataset=parkings&q=`;

  let resp = await fetch(url__parkings);
  if (!resp.ok) {
    console.log("Ophalen van data is mislukt");
    return;
  }

  const data = await resp.json();
  parkings = data.records;

  return parkings;
}
