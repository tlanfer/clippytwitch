set GOOS=linux
go build -v -o lambda github.com\tlanfer\clippytwitch\cmd\storage
build-lambda-zip -o storage.zip lambda
del lambda