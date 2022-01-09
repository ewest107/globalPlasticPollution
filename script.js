d3.csv("./data/Plastic-and-GDP-data.csv").then(function(data) {


    const width = document.querySelector("#chart").clientWidth;
    const height = document.querySelector("#chart").clientHeight;
    const margin = {top: 25, left: 100, right: 25, bottom: 100};

    const canvas = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    background = canvas.append('g');
    foreground = canvas.append('g');

    /*making a button*/

    const buttonDiv = d3.select("#flexButtons").append("div");
    const button = buttonDiv.append("input").attr("type", "checkbox");
    const buttonP = buttonDiv.append("p").html("Show Global Plastic Waste (275 Million Tons/Year)");
    buttonDiv.attr("id", "button");


    /*Making the variable scale correctly*/
    
    const perCapPlastic = {
        min: d3.min(data, function(d) { return (+d.perCapitaplasticwaste * 365); }),
        max: d3.max(data, function(d) { return (+d.perCapitaplasticwaste * 365); })
    };

    const perCapGDP = {
        min: d3.min(data, function(d) { return +d.gdpPercap2007; }),
        max: d3.max(data, function(d) { return +d.gdpPercap2007; })
    };

    const totalCountryWaste = {
        min: d3.min(data, function(d) { return +d.plasticWasteGen; }),
        max: d3.max(data, function(d) { return +d.plasticWasteGen; })
    };

    const population = {
        min: d3.min(data, function(d) { return +d.pop2010; }),
        max: d3.max(data, function(d) { return +d.pop2010; }),
    };
        
    const xScale = d3.scaleLinear()
        .domain([perCapPlastic.min, perCapPlastic.max])
        .range([margin.left, width-margin.right]);

    const yScale = d3.scaleLinear()
        .domain([perCapGDP.min, perCapGDP.max])
        .range([height-margin.bottom, margin.top]);

    const rScale = d3.scaleSqrt()
        .domain([totalCountryWaste.min, totalCountryWaste.max])
        .range([2, 50]);

    const fillScale = d3.scaleOrdinal()
        .domain(["North America", "Asia","Europe","Africa","South America","Oceania"])
        .range(["#446688", "#CC0000","#AB57C0","#ebd742","#20BD44","#db810b"]);


        /*drawing the circles*/

    const points = foreground.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
            .attr("cx", function(d) { return xScale(d.perCapitaplasticwaste * 365); })
            .attr("cy", function(d) { return yScale(d.gdpPercap2007); })
            .attr("r", function(d) { return rScale(d.plasticWasteGen); })
            .attr("fill", function(d) { return fillScale(d.continent); })
            .attr("opacity", 0.8);


        /*making the axes*/

    const xAxis = canvas.append("g")
        .attr("transform",`translate(0,${height-margin.bottom+20})`)
        .call(d3.axisBottom().scale(xScale).tickFormat(d3.format("")));

    const yAxis = canvas.append("g")
        .attr("transform",`translate(${margin.left},0)`)
        .call(d3.axisLeft().scale(yScale).tickFormat(d3.format("")));

    canvas.append("text")
        .attr("class","axisLabel")
        .attr("x", margin.left + (width-margin.left-margin.right)/2)
        .attr("y", height - 20)
        .attr("text-anchor","middle")
        .text("Plastic Waste Per Capita (Kg/Year)");

    canvas.append("text")
        .attr("class","axisLabel")
        .attr("x", -(height-margin.bottom)/2)
        .attr("y", 30)
        .attr("text-anchor","middle")
        .attr("transform","rotate(-90)")
        .text("GDP per Capita (USD/Year)");

    const tooltip = d3.select("#chart")
        .append("div")
        .attr("class", "tooltip");

        /*Adding the global plastic waste circle for comparison, hiding it*/
    
    const globalCompare = background.append("circle")
        .attr("r", 107)
        .attr("fill", "grey")
        .attr("opacity", .4)
        .style("visibility", "hidden");


    points.on("mouseover", function(e, d) {
        let cx = +d3.select(this).attr("cx") +50 ;
        let cy = +d3.select(this).attr("cy") -50 ;


        

        
        tooltip.style("visibility", "visible")
            .style("left", `${cx}px`)
            .style("top", `${cy}px`)
            .html(`<b>Country:</b> <strong>${d.Entity}</strong><br>
            <br>
            <b>Plastic Waste Generated:</b> ${d.plasticWasteGen} <b>Tons/Year</b> <br>
            <b>Plastic Waste Per Capita: </b> ${Math.round(d.perCapitaplasticwaste * 365 * 100) / 100} <b>Kg/Year</b> <br>
            <b>GDP Per Capita: </b> ${d.gdpPercap2007} <b>USD/Year</b> <br>
            <b>Population:</b> ${d.pop2010} <br>
            <b>Continent: </b> ${d.continent}
            
            `);

        
            /*calculating the x, y position of comparison circle so that it's tangent to moused over circles*/

            const displacement = globalCompare.attr("r") - +d3.select(this).attr("r");
            const dx = displacement * Math.SQRT1_2

            /*making comparison circle visible if button is checked*/


            if (button.property("checked")){
                globalCompare.style("visibility", "visible")
                    .attr("cx", cx - dx -50)
                    .attr("cy", cy + dx +50);
            };
            
            d3.select(this)
                .attr("fill-opacity", 1);


        }).on("mouseout", function() {
            tooltip.style("visibility", "hidden");
            globalCompare.style("visibility", "hidden");

            d3.select(this)
                .attr("fill-opacity", 0.8);
    });


    d3.select("#population").on("click", function() {

        buttonP.html("Show Global Population (6.9 Billion)");


        rScale.domain([population.min, population.max]);
        rScale.range([2, 70]);


        let popPoints = foreground.selectAll("circle")
            .data(data);

            popPoints.enter()

                .merge(popPoints)
                    .transition()
                    .duration(1000)
                    .delay(250)
                .attr("cx", function(d) { return xScale(d.perCapitaplasticwaste * 365); })
                .attr("cy", function(d) { return yScale(d.gdpPercap2007); })
                .attr("r", function(d) { return rScale(d.pop2010); })
                .attr("fill", function(d) { return fillScale(d.continent); })
                .attr("opacity", 0.8);

            popPoints.exit()
                .remove();
    
    
                points.on("mouseover", function(e, d) {
                    let cx = +d3.select(this).attr("cx") +50 ;
                    let cy = +d3.select(this).attr("cy") -50 ;
            
                    
                    tooltip.style("visibility", "visible")
                        .style("left", `${cx}px`)
                        .style("top", `${cy}px`)
                        .html(`<b>Country:</b> <strong>${d.Entity}</strong><br>
                        <br>
                        <b>Plastic Waste Generated:</b> ${d.plasticWasteGen} <b>Tons/Year</b> <br>
                        <b>Plastic Waste Per Capita: </b> ${Math.round(d.perCapitaplasticwaste * 365 * 100) / 100} <b>Kg/Year</b> <br>
                        <b>GDP Per Capita: </b> ${d.gdpPercap2007} <b>USD/Year</b> <br>
                        <b>Population:</b> ${d.pop2010} <br>
                        <b>Continent: </b> ${d.continent}
                        
                        `);

                    if (button.property("checked")){

                        globalCompare
                            .attr("r", 158.86)

                        const displacement2 = globalCompare.attr("r") - +d3.select(this).attr("r");
                        const Popdx = displacement2 * Math.SQRT1_2

                        globalCompare.style("visibility", "visible")
                        
                        .attr("cx", cx + Popdx -50)
                        .attr("cy", cy + Popdx +50);
                    };
                    
                    d3.select(this)
                        .attr("fill-opacity", 1);
            
            
                }).on("mouseout", function() {
                    tooltip.style("visibility", "hidden");
                    globalCompare.style("visibility", "hidden");
            
                    d3.select(this)
                        .attr("fill-opacity", 0.8);
                });
    
    
    
            });


    d3.select("#totalwaste").on("click", function() {

        buttonP.html("Show Global Plastic Waste (275 Million Tons/Year)");


        rScale.domain([totalCountryWaste.min, totalCountryWaste.max]);
        rScale.range([2, 50]);


        let popPoints = foreground.selectAll("circle")
            .data(data);

            popPoints.enter()

                .merge(popPoints)
                    .transition()
                    .duration(1000)
                    .delay(250)
                .attr("cx", function(d) { return xScale(d.perCapitaplasticwaste * 365); })
                .attr("cy", function(d) { return yScale(d.gdpPercap2007); })
                .attr("r", function(d) { return rScale(d.plasticWasteGen); })
                .attr("fill", function(d) { return fillScale(d.continent); })
                .attr("opacity", 0.8);

            popPoints.exit()
                .remove();
    


        points.on("mouseover", function(e, d) {
            let cx = +d3.select(this).attr("cx") +50 ;
            let cy = +d3.select(this).attr("cy") -50 ;

            
            tooltip.style("visibility", "visible")
                .style("left", `${cx}px`)
                .style("top", `${cy}px`)
                .html(`<b>Country:</b> <strong>${d.Entity}</strong><br>
                <br>
                <b>Plastic Waste Generated:</b> ${d.plasticWasteGen} <b>Tons/Year</b> <br>
                <b>Plastic Waste Per Capita: </b> ${Math.round(d.perCapitaplasticwaste * 365 * 100) / 100} <b>Kg/Year</b> <br>
                <b>GDP Per Capita: </b> ${d.gdpPercap2007} <b>USD/Year</b> <br>
                <b>Population:</b> ${d.pop2010} <br>
                <b>Continent: </b> ${d.continent}
                
                `);

            if (button.property("checked")){

                globalCompare
                    .attr("r", 107)

                const displacement = globalCompare.attr("r") - +d3.select(this).attr("r");
                const dx = displacement * Math.SQRT1_2

                globalCompare.style("visibility", "visible")
                
                .attr("cx", cx - dx -50)
                .attr("cy", cy + dx +50);
            };
            
            d3.select(this)
                .attr("fill-opacity", 1);


            }).on("mouseout", function() {
                tooltip.style("visibility", "hidden");
                globalCompare.style("visibility", "hidden");

                d3.select(this)
                    .attr("fill-opacity", 0.8);
            });

});


});