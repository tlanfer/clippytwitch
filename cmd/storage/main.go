package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/aws/external"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/dynamodbattribute"
	"log"
	"net/http"
	"time"
)

const tableName = "clippytwitchconfigs"

var errNoConfig = errors.New("no config for that key")

var ddb *dynamodb.DynamoDB = nil

func main() {

	lambda.Start(HandleRequest)
}

func HandleRequest(ctx context.Context, request events.APIGatewayProxyRequest) (*events.APIGatewayProxyResponse, error) {

	uniqueKey := request.QueryStringParameters["uniqueKey"]
	if uniqueKey == "" {
		return &events.APIGatewayProxyResponse{
			StatusCode: http.StatusBadRequest,
			Body:       "must provide a uniqueKey",
		}, nil
	}

	switch request.HTTPMethod {
	case http.MethodHead:
		fallthrough
	case http.MethodGet:
		dto, err := getConfig(uniqueKey)

		if err == errNoConfig {
			now := time.Now()
			dto = &ConfigDto{
				UniqueKey:    uniqueKey,
				LastAccessed: &now,
				Twitch: TwitchConfigDto{
					Enabled:  false,
					Username: "",
					Token:    "",
					Channels: []string{},
					Reactions: []TwitchReactionDto{
						{"tlanfer", "GetAttention", "tlanfer is amazing!"},
					},
				},
				StreamLabs: StreamlabsConfigDto{
					Enabled: false,
					Token:   "",
				},
			}
			putConfig(uniqueKey, *dto)
		}

		buffer := bytes.Buffer{}
		json.NewEncoder(&buffer).Encode(dto)

		return &events.APIGatewayProxyResponse{
			StatusCode: http.StatusOK,
			Headers: map[string]string{
				"Content-Type":                "application/json",
				"Access-Control-Allow-Origin": "*",
			},
			Body: buffer.String(),
		}, nil

	case http.MethodPost:
		configDto := ConfigDto{}
		json.NewDecoder(bytes.NewBufferString(request.Body)).Decode(&configDto)
		putConfig(uniqueKey, configDto)
		return &events.APIGatewayProxyResponse{
			StatusCode: http.StatusOK,
		}, nil
	default:
		return &events.APIGatewayProxyResponse{
			StatusCode: http.StatusMethodNotAllowed,
			Body:       "only get/post",
		}, nil
	}
}

func getDynamoDBClient() *dynamodb.DynamoDB {

	if ddb == nil {
		sess, err := external.LoadDefaultAWSConfig()
		if err != nil {
			panic(err)
		}

		ddb = dynamodb.New(sess)
	}

	return ddb
}

func getConfig(uniqueKey string) (*ConfigDto, error) {

	output, err := getDynamoDBClient().GetItemRequest(&dynamodb.GetItemInput{
		TableName: aws.String(tableName),
		Key: map[string]dynamodb.AttributeValue{
			"uniqueKey": dynamodb.AttributeValue{
				S: aws.String(uniqueKey),
			},
		},
	}).Send()

	if err != nil {
		log.Println("failed to read GetItem from dynamodb: ", err)
		return nil, err
	}

	item := ConfigDto{}
	err = dynamodbattribute.UnmarshalMap(output.Item, &item)

	if err != nil {
		log.Println("failed to unmarshal item from dynamodb: ", err)
		return nil, err
	}

	if item.LastAccessed == nil {
		log.Printf("no item in dynamodb for uniqueKey %s", uniqueKey)
		return nil, errNoConfig
	}

	return &item, nil
}

func putConfig(uniqueKey string, config ConfigDto) error {

	now := time.Now()
	config.LastAccessed = &now

	item, err := dynamodbattribute.MarshalMap(config)
	if err != nil {
		return err
	}

	_, err = getDynamoDBClient().PutItemRequest(&dynamodb.PutItemInput{
		TableName: aws.String(tableName),
		Item:      item,
	}).Send()

	if err != nil {
		return err
	}

	return nil
}

type TwitchReactionDto struct {
	Keyword   string `json:"keyword"`
	Animation string `json:"animation"`
	Message   string `json:"message"`
}

type TwitchConfigDto struct {
	Enabled   bool                `json:"enabled"`
	Username  string              `json:"username"`
	Token     string              `json:"token"`
	Channels  []string            `json:"channels"`
	Reactions []TwitchReactionDto `json:"reactions"`
}

type StreamlabsConfigDto struct {
	Enabled bool   `json:"enabled"`
	Token   string `json:"token"`
}

type ClippyConfigDto struct {
	Autohide bool `json:"autohide"`
	Sound bool `json:"sound"`
}

type ConfigDto struct {
	UniqueKey    string              `json:"uniqueKey"`
	LastAccessed *time.Time          `json:"lastAccessed"`
	Clippy       ClippyConfigDto     `json:"clippy"`
	Twitch       TwitchConfigDto     `json:"twitch"`
	StreamLabs   StreamlabsConfigDto `json:"streamlabs"`
}
