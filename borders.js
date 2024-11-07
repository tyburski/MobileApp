let borders = [
    {"id":1, "name":"Świecko", "country1": "PL", "country2": "D", "latitude": 52.315559, "longitude": 14.577705 },
    {"id":2, "name":"Słubice", "country1": "PL", "country2": "D", "latitude": 52.347898, "longitude": 14.555103 },
    {"id":3, "name":"Gubin", "country1": "PL", "country2": "D", "latitude": 51.951784, "longitude": 14.721310 },
    {"id":4, "name":"Ostrawa", "country1": "PL", "country2": "CZ", "latitude": 50.083292, "longitude": 19.972675 },
    {"id":5, "name":"Rozvadov", "country1": "CZ", "country2": "D", "latitude": 50.082907, "longitude": 19.974821 },
    {"id":6, "name":"Jędrzychowice", "country1": "PL", "country2": "D", "latitude": 50.083386, "longitude": 19.979451 },
]











export function ConvertToGeolib()
{
    const convertedList = [];

    for (let i = 0; i < borders.length; i++) {
        const newConvertedObject = {"latitude": borders[i].latitude, "longitude": borders[i].longitude}
        convertedList.push(newConvertedObject);
    }
    return convertedList;
}

export function GetByCoords(lat , lng, param)
{
    const found = borders.find((element) => element.latitude === lat && element.longitude === lng );
    const p = param;
    if(found != null)
    {
        if(p === "name")
        {
            return found.name;
        }
        else if(p === found.country1)
        {
            return found.country2;
        }
        else if(p === found.country2)
        {
                return found.country1;
        }
        else return "X";
        
    }
    else return "X";
}