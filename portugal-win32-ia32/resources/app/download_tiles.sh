for z in {0..6}
do
    for x in $(eval echo {0..$((2**$z-1))})
    do
        for y in $(eval echo {0..$((2**$z-1))})
        do
            mkdir -p tiles/$z/$x
            wget -U "Custom tile downloader/0.0.0" -O tiles/$z/$x/$y.png https://a.tile.openstreetmap.org/$z/$x/$y.png
        done
    done
done

