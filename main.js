const map = new maplibregl.Map({
    container: 'map',
    style: 'https://raw.githubusercontent.com/gtitov/basemaps/refs/heads/master/positron-nolabels.json',
    center: [40, 55],
    zoom: 3
});

map.on("load", () => {
    map.addSource("cities", {
        type: "geojson",
        data: 'http://127.0.0.1:5000/cities/2018'
    })

    map.addLayer({
        id: 'cities-layer',
        source: 'cities',
        type: 'circle',
        paint: {
            "circle-stroke-width": 1,
            "circle-stroke-color": "#FFFFFF",
            "circle-color": [
                'interpolate', ['linear'],
                ['get', 'total_points'],
                50, '#d7191c',
                150, '#ffffbf',
                250, '#1a9641'
            ],
            "circle-opacity": 0.8,
            "circle-radius": [
                "match",
                ["get", "group_name"],
                "Малый город", 3,
                "Средний город", 6,
                'Большой город', 6,
                'Крупный город', 8,
                'Крупнейший город', 12,
                0 // остальные
            ]
        }
    })

    document.getElementById("year-selector").addEventListener(
        'change',
        (e) => {
            const year = e.target.value
            map.getSource('cities').setData(`http://127.0.0.1:5000/cities/${year}`)
        }
    )

    map.on('click', 'cities-layer', (e) => {
        console.log(e.features[0].properties.id)
        fetch(`http://127.0.0.1:5000/city/${e.features[0].properties.id}`)
            .then(response => response.json())
            .then(cityProperties => {
                console.log(cityProperties)
                document.getElementById("city-details-modal").innerHTML = `<h1>${cityProperties.name}</h1>
                            <img src="${cityProperties.emblem_url}" height="200">
                            <h3>Численность населения</h3><h2>${cityProperties.people_count} тыс. чел</h2>
                            <h3>Индекс качества городской среды</h3><h2>${cityProperties.total_points} / 360</h2>
                            <hr>
                            <h3>Жилье и прилегающие пространства</h3><h2>${cityProperties.house_points} / 60</h2>
                            <h3>Озелененные пространства</h3><h2>${cityProperties.park_points} / 60</h2>
                            <h3>Общественно-деловая инфраструктура</h3><h2>${cityProperties.business_points} / 60</h2>
                            <h3>Социально-досуговая инфраструктура</h3><h2>${cityProperties.social_points} / 60</h2>
                            <h3>Улично-дорожная</h3><h2>${cityProperties.street_points} / 60</h2>
                            <h3>Общегородское пространство</h3><h2>${cityProperties.common_points} / 60</h2>`
                document.getElementById("city-details-modal").showModal() // showModal() -- встроенный метод элемента <dialog>
            })
    })

    map.on('mouseenter', 'cities-layer', () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'cities-layer', () => {
        map.getCanvas().style.cursor = '';
    });
})

// fetch("http://127.0.0.1:5000/cities/2018")
//     .then((response) => response.json())
//     .then((json) => console.log(json))