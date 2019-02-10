package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"log"
	"net/http"
	"net/url"
	"os"
)

var clientId = os.Getenv("CLIENT_ID")
var clientSecret = os.Getenv("CLIENT_SECRET")
const redirectUri = "https://8m2t1eqw8c.execute-api.eu-central-1.amazonaws.com/thing/callback"

const AccessTokenCookie = "twitch_access_token"
const StreamLabsApiBase = "https://www.streamlabs.com/api/v1.0"

func HandleRequest(ctx context.Context, request events.APIGatewayProxyRequest) (*events.APIGatewayProxyResponse, error) {

	code := request.QueryStringParameters["code"]

	log.Println("Got a code: ", code)

	values := url.Values{
		"grant_type":    []string{"authorization_code"},
		"client_id":     []string{clientId},
		"client_secret": []string{clientSecret},
		"redirect_uri":  []string{redirectUri},
		"code":          []string{code},
	}

	resp, err := http.PostForm(StreamLabsApiBase+"/token", values)

	if err != nil {
		log.Println(err)
		return nil, err
	}

	if resp.StatusCode != 200 {
		buf := new(bytes.Buffer)
		buf.ReadFrom(resp.Body)
		newStr := buf.String()

		log.Printf("status [%v], body: %v", resp.StatusCode, newStr)
		return nil, errors.New("failed to exchange code for token");
	}

	var dto = struct {
		AccessToken  string `json:"access_token"`
		RefreshToken string `json:"refresh_token"`
		TokenType    string `json:"token_type"`
	}{}

	json.NewDecoder(resp.Body).Decode(&dto)

	//accessCookie := http.Cookie{
	//	Name:  AccessTokenCookie,
	//	Value: dto.AccessToken,
	//}

	b := fmt.Sprintf(`
<h1>Success!</h1>
Your streamlabs accesstoken is: 
<input type="text" value="%v">
Copy it, then add it to the configuration on the <a href="/">main page</a>.
`, dto.AccessToken)

	return &events.APIGatewayProxyResponse{
		StatusCode: http.StatusOK,
		Headers: map[string]string{
			"content-type": "text/html",
		},
		Body: b,
	},nil
}

func main() {
	lambda.Start(HandleRequest)
}
