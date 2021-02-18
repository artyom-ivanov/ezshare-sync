# ezShare Sync
Simple app for sync folder on ezShare sync and folder on your computer. You must be on ezShare network to sync.

### Install
Clone this repo, go to project folder and type:

`npm install`

### Usage
For start app type in console:

`node index.js -i DIRECTORY -o OUTPUT_FOLDER -f FULLSYNC_MODE`

`DIRECTORY` - folder url from ezShare web interface
`OUTPUT_FOLDER` - foldername, where app will save files
`FULLSYNC_MODE` - check output folder every iteration or not (y/n)

For example, for saving to "out" folder:

`node index.js -i http://ezshare.card/dir\?dir\=A:%5CDCIM%5C589___01 -o out`


