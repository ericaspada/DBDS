
//Build a stored procedure called usp_kmeans for the Genome table
//usp_kmeans accepts @k as input (number of clusters) and returns k centroids (one centroid for each cluster).
use GEO
geo = db.GEO
geo.find().limit(1)
// user sets k
target_name = 'icSARS'
collection = db.genome_icSARS //swap this for geo.aggregrate
// use one time slice or several?
// average the 3 replicates
var expvalues = geo.aggregate(
   [{$project: {"Comment [Sample_source_name]":1,"FactorValue [INFECTION CODE]":1,
       'FactorValue [TIME]\\':1, "A_23_P252981":1, "A_23_P100501":1, "A_23_P100576":1, "A_23_P100486":1, "A_23_P100455":1}},
   {$match: {'Comment [Sample_source_name]':'SHAE004_icSARS_48h_1'}}
   //{$match: {'FactorValue [TIME]\\':'48h\\'}} // take only 48h data
  // {$group: {_id: "$FactorValue [TIME]\\"}}, // group by time
     // avg1: {$avg: '$A_23_P252981'}}} // take the average of the 3 replicates
   ]
)
expvalues

k = 5 // set the number of clusters
var testarray = [8.86, 4.45,12.22,3.11,11.99,11.88,11.22,12.21,12.33,9.99] // using fake data for now

var clusters = Array.from(Array(k).keys()) // create clusters
var centroids = testarray.sort(() => Math.random() - Math.random()).slice(0, k) // choose k random values as centroids

while (centroids !== centroidsnew){
    
function distance(a,b){
    return Math.abs(a-b)
}; // calculates euclidian distance for 1 dimension

var cluster_state = testarray.map(function(val){
    var distances = centroids.map(c => (distance(val,c))) // distance between each centroid and value
    min = Math.min.apply(Math,distances) // min distance 
    nearest = distances.indexOf(Math.min.apply(Math,distances)) // get the nearest cluster
    return [val, nearest]
}) // returns an array for each value with the value and the nearest cluster

var allclusters = clusters.map(function(cluster){
    var values = cluster_state.map(function(element){
        if (element[1]===cluster){return element[0]}})
    return values
}); // for each cluster, find the values that belong to that cluster and put them in a new array

var allclusters = allclusters.map(a => {
    var af = a.filter(c => {
        return c !== undefined;
        });
        return af
    }); // remove the 'undefined' elements

// function to calculate mean
function mean(element){
    var n = element.length
    var mean = element.reduce((a,b) => a+b)/n;
    return mean
};
 
var centroidsnew = allclusters.map(function(cluster){
    var centroid = mean(cluster)
    return centroid
}); // make a new array with the new centroids
}
