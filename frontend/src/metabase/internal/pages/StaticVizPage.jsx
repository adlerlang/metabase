import React, { useState } from "react";
import Heading from "metabase/components/type/Heading";
import Subhead from "metabase/components/type/Subhead";
import Text from "metabase/components/type/Text";
import {
  STATIC_CHART_TYPES,
  STATIC_CHART_DEFAULT_OPTIONS,
} from "metabase/static-viz/containers/StaticChart/constants";
import StaticChart from "metabase/static-viz/containers/StaticChart";
import {
  CATEGORICAL_DONUT_CHART_DEFAULT_OPTIONS,
  CATEGORICAL_DONUT_CHART_TYPE,
} from "../../static-viz/components/CategoricalDonutChart/constants";
import {
  PROGRESS_BAR_DEFAULT_DATA_1,
  PROGRESS_BAR_DEFAULT_DATA_2,
  PROGRESS_BAR_DEFAULT_DATA_3,
  PROGRESS_BAR_DEFAULT_DATA_4,
  PROGRESS_BAR_TYPE,
} from "../../static-viz/components/ProgressBar/constants";
import {
  TIME_SERIES_WATERFALL_CHART_DEFAULT_OPTIONS,
  CATEGORICAL_WATERFALL_CHART_DEFAULT_OPTIONS,
  WATERFALL_CHART_TYPE,
} from "../../static-viz/components/WaterfallChart/constants";
import {
  FUNNEL_CHART_DEFAULT_OPTIONS,
  FUNNEL_CHART_TYPE,
} from "../../static-viz/components/FunnelChart/constants";
import {
  LINE_AREA_BAR_CHART_TYPE,
  LINE_AREA_BAR_DEFAULT_OPTIONS_1,
  LINE_AREA_BAR_DEFAULT_OPTIONS_2,
  LINE_AREA_BAR_DEFAULT_OPTIONS_3,
  LINE_AREA_BAR_DEFAULT_OPTIONS_4,
  LINE_AREA_BAR_DEFAULT_OPTIONS_5,
  LINE_AREA_BAR_DEFAULT_OPTIONS_6,
  LINE_AREA_BAR_DEFAULT_OPTIONS_7,
} from "../../static-viz/components/LineAreaBarChart/constants";
import { PageRoot, PageSection } from "./StaticVizPage.styled";

function chartOptionsToStr(options) {
  if (typeof options === "object") {
    return JSON.stringify(options, null, 2);
  }
  return String(options);
}

export default function StaticVizPage() {
  const [staticChartType, setStaticChartType] = useState(null);
  const [staticChartCustomOptions, setStaticChartCustomOptions] =
    useState(null);
  const [staticChartError, setStaticChartError] = useState(null);

  function chartOptionsToObj(optionsStr) {
    try {
      const chartOptions = JSON.parse(optionsStr);
      setStaticChartError(null);
      return chartOptions;
    } catch (err) {
      console.error(err);
      setStaticChartError(err.toString());
    }
    return optionsStr;
  }

  return (
    <PageRoot>
      <div className="wrapper wrapper--trim">
        <Heading>Static Visualisations</Heading>
        <Text>
          These visualizations are used in dashboard subscriptions. They have no
          interactivity and get generated by the backend to be sent to Slack or
          in emails. You can use this playground to work on the source code in
          /static-viz/ and see the effects. You might need to hard refresh to
          see updates.
        </Text>

        <PageSection>
          <Subhead>Chart tester</Subhead>

          <select
            className="w-full mt1"
            onChange={e => {
              const index = parseInt(e.target.value);
              setStaticChartType(STATIC_CHART_TYPES[index]);
              setStaticChartCustomOptions({
                ...STATIC_CHART_DEFAULT_OPTIONS[index],
              });
            }}
          >
            <option id="">---</option>
            {STATIC_CHART_TYPES.map((chartType, chartTypeIndex) => (
              <option key={chartType} value={chartTypeIndex}>
                {chartType}
              </option>
            ))}
          </select>

          {(staticChartCustomOptions ||
            typeof staticChartCustomOptions === "string") && (
            <textarea
              className="w-full mt1"
              value={chartOptionsToStr(staticChartCustomOptions)}
              onChange={e => {
                const chartOptionsStr = e.target.value;
                if (chartOptionsStr.length > 0) {
                  setStaticChartCustomOptions(
                    chartOptionsToObj(chartOptionsStr),
                  );
                } else {
                  setStaticChartCustomOptions(chartOptionsStr);
                }
              }}
            />
          )}

          {staticChartError && (
            <p className="text-bold text-error mt1 mb0">{staticChartError}</p>
          )}

          {!staticChartError && staticChartType && staticChartCustomOptions && (
            <div className="text-code-plain w-full mt1">
              <StaticChart
                type={staticChartType}
                options={{ ...staticChartCustomOptions }}
              />
            </div>
          )}
        </PageSection>
        <PageSection>
          <Subhead>Donut chart with categorical data</Subhead>
          <StaticChart
            type={CATEGORICAL_DONUT_CHART_TYPE}
            options={CATEGORICAL_DONUT_CHART_DEFAULT_OPTIONS}
          />
        </PageSection>
        <PageSection>
          <Subhead>Progress bar</Subhead>
          <StaticChart
            type={PROGRESS_BAR_TYPE}
            options={PROGRESS_BAR_DEFAULT_DATA_1}
          />
          <StaticChart
            type={PROGRESS_BAR_TYPE}
            options={PROGRESS_BAR_DEFAULT_DATA_2}
          />
          <StaticChart
            type={PROGRESS_BAR_TYPE}
            options={PROGRESS_BAR_DEFAULT_DATA_3}
          />
          <StaticChart
            type={PROGRESS_BAR_TYPE}
            options={PROGRESS_BAR_DEFAULT_DATA_4}
          />
        </PageSection>
        <PageSection>
          <Subhead>Waterfall chart with timeseries data and no total</Subhead>
          <StaticChart
            type={WATERFALL_CHART_TYPE}
            options={TIME_SERIES_WATERFALL_CHART_DEFAULT_OPTIONS}
          />
        </PageSection>
        <PageSection>
          <Subhead>
            Waterfall chart with categorical data and total (rotated X-axis tick
            labels)
          </Subhead>
          <StaticChart
            type={WATERFALL_CHART_TYPE}
            options={CATEGORICAL_WATERFALL_CHART_DEFAULT_OPTIONS}
          />
        </PageSection>
        <PageSection>
          <Subhead>Line/Area/Bar chart with multiple series</Subhead>
          <StaticChart
            type={LINE_AREA_BAR_CHART_TYPE}
            options={LINE_AREA_BAR_DEFAULT_OPTIONS_1}
          />
        </PageSection>

        <PageSection>
          <Subhead>
            Line/Area/Bar chart with negative values, different X ranges, and
            right Y-axis
          </Subhead>
          <StaticChart
            type={LINE_AREA_BAR_CHART_TYPE}
            options={LINE_AREA_BAR_DEFAULT_OPTIONS_2}
          />
        </PageSection>

        <PageSection>
          <Subhead>
            Combo chart with ordinal X-axis and more than 10 ticks
          </Subhead>
          <StaticChart
            type={LINE_AREA_BAR_CHART_TYPE}
            options={LINE_AREA_BAR_DEFAULT_OPTIONS_3}
          />
        </PageSection>

        <PageSection>
          <Subhead>Stacked area chart</Subhead>
          <StaticChart
            type={LINE_AREA_BAR_CHART_TYPE}
            options={LINE_AREA_BAR_DEFAULT_OPTIONS_4}
          />
        </PageSection>

        <PageSection>
          <Subhead>Ordinal chart with 48 items</Subhead>
          <StaticChart
            type={LINE_AREA_BAR_CHART_TYPE}
            options={LINE_AREA_BAR_DEFAULT_OPTIONS_5}
          />
        </PageSection>

        <PageSection>
          <Subhead>Ordinal chart with 200 items</Subhead>
          <StaticChart
            type={LINE_AREA_BAR_CHART_TYPE}
            options={LINE_AREA_BAR_DEFAULT_OPTIONS_6}
          />
        </PageSection>

        <PageSection>
          <Subhead>Ordinal chart with 20 items</Subhead>
          <StaticChart
            type={LINE_AREA_BAR_CHART_TYPE}
            options={LINE_AREA_BAR_DEFAULT_OPTIONS_7}
          />
        </PageSection>

        <PageSection>
          <Subhead>Funnel</Subhead>
          <StaticChart
            type={FUNNEL_CHART_TYPE}
            options={FUNNEL_CHART_DEFAULT_OPTIONS}
          />
        </PageSection>
      </div>
    </PageRoot>
  );
}
