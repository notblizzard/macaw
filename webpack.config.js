/* eslint-disable */

//const TerserWebpackPlugin = require("terser-webpack-plugin");
//const MiniCssExtractPlugin = require("mini-css-extract-plugin");
//const VueLoaderPlugin = require("vue-loader/lib/plugin");
const CopyPlugin = require("copy-webpack-plugin");

//const CompressionPlugin = require("compression-webpack-plugin");
//.BundleAnalyzerPlugin;
const webpack = require("webpack");
const path = require("path");

module.exports = {
  entry: ["./resources/app.scss", "./resources/App.tsx"],
  /*plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.join(__dirname, "/views/index.html"),
          to: path.join(__dirname, "/build/views/index.html"),
        },
      ],
    }),
  ],*/
  module: {
    rules: [
      {
        test: /\.ts(x)?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              configFile: "tsconfig.webpack.json",
            },
          },
        ],
        //use: ["ts-loader"],
        exclude: /node_modules/,
      },
      {
        test: /\.s[ac]ss$/i,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
};
