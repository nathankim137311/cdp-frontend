import React, { FC, Dispatch, SetStateAction, RefObject, useMemo } from "react";
import { TabProps } from "semantic-ui-react";

import { useLanguageConfigContext } from "../../app/LanguageConfigContext";

import LazyFetchDataContainer from "../FetchDataContainer/LazyFetchDataContainer";
import { FetchDataState } from "../FetchDataContainer/useFetchData";
import { TranscriptFull } from "../../components/Details/TranscriptFull";
import { TranscriptItemRef } from "../../components/Details/TranscriptItem/TranscriptItem";
import { MinutesItemsList } from "../../components/Details/MinutesItemsList";
import { MeetingVotesTable } from "../../components/Tables/MeetingVotesTable";
import ResponsiveTab from "../../components/Shared/ResponsiveTab";
import { ECEventMinutesItem, ECSentence, ECVote } from "./types";

import { strings } from "../../assets/LocalizedStrings";

interface EventInfoTabsProps {
  currentInfoTab: number;
  setCurrentInfoTab: Dispatch<SetStateAction<number>>;
  sentences: FetchDataState<ECSentence[]>;
  transcriptItemsRefs: RefObject<TranscriptItemRef>[];
  eventMinutesItems: ECEventMinutesItem[];
  votes: ECVote[];
  jumpToVideoClip(sessionIndex: number, startTime: number): void;
}

const EventInfoTabs: FC<EventInfoTabsProps> = ({
  currentInfoTab,
  setCurrentInfoTab,
  sentences,
  transcriptItemsRefs,
  eventMinutesItems,
  votes,
  jumpToVideoClip,
}: EventInfoTabsProps) => {
  const { language } = useLanguageConfigContext();

  const onInfoTabChange = (_: any, data: TabProps) => setCurrentInfoTab(data.activeIndex as number);

  const minutesItems = useMemo(() => {
    return eventMinutesItems.map(({ minutes_item, files }) => {
      return {
        name: minutes_item?.name as string,
        description: minutes_item?.description,
        matter_ref: minutes_item?.matter_ref,
        documents:
          files && files.length > 0
            ? files.map(({ name, uri }) => {
                return {
                  label: name,
                  url: uri,
                };
              })
            : undefined,
      };
    });
  }, [eventMinutesItems]);

  const votesByEventMinutesItemDict = useMemo(() => {
    return votes.reduce((dict, vote) => {
      if (!Object.keys(dict).includes(vote.event_minutes_item_ref)) {
        dict[vote.event_minutes_item_ref] = [];
      }
      dict[vote.event_minutes_item_ref].push(vote);
      return dict;
    }, {} as Record<string, ECVote[]>);
  }, [votes]);

  const votesByEventMinutesItem = useMemo(() => {
    return eventMinutesItems.map((eventMinutesItem) => {
      return votesByEventMinutesItemDict[eventMinutesItem.id] || [];
    });
  }, [votesByEventMinutesItemDict, eventMinutesItems]);

  const votesPage = useMemo(() => {
    const votesPage: object[] = [];
    eventMinutesItems.forEach(({ minutes_item, decision }, i) => {
      const votesForEventMinutesItem = votesByEventMinutesItem[i];
      if (votesForEventMinutesItem && votesForEventMinutesItem.length > 0) {
        votesPage.push({
          matter: {
            name: minutes_item?.name,
            description: minutes_item?.description,
            id: minutes_item?.matter_ref,
          },
          council_decision: decision,
          votes: votesForEventMinutesItem.map(({ person, decision, id }) => {
            return {
              personId: person?.id,
              name: person?.name,
              decision: decision,
              id: id,
            };
          }),
        });
      }
    });
    return votesPage;
  }, [eventMinutesItems, votesByEventMinutesItem]);

  const infoTabPanes = useMemo(() => {
    return [
      {
        menuItem: strings.agenda,
        pane: {
          key: "agenda",
          content: <MinutesItemsList minutesItems={minutesItems} />,
        },
      },
      {
        menuItem: strings.transcript,
        pane: {
          key: "transcript",
          content: (
            <LazyFetchDataContainer
              data="transcript"
              isLoading={sentences.isLoading}
              error={sentences.error}
              notFound={!sentences.data || sentences.data.length === 0}
            >
              {sentences.data && (
                <TranscriptFull
                  sentences={sentences.data}
                  transcriptItemsRefs={transcriptItemsRefs}
                  jumpToVideoClip={jumpToVideoClip}
                />
              )}
            </LazyFetchDataContainer>
          ),
        },
      },
      {
        menuItem: strings.votes,
        pane: { key: "votes", content: <MeetingVotesTable votesPage={votesPage} /> },
      },
    ];
    // `langugage` is needed as a dependency in order to change the tab labels
  }, [minutesItems, sentences, transcriptItemsRefs, jumpToVideoClip, votesPage, language]);

  return (
    <ResponsiveTab
      padding="16px"
      menu={{ secondary: true, pointing: true }}
      panes={infoTabPanes}
      activeIndex={currentInfoTab}
      onTabChange={onInfoTabChange}
      renderActiveOnly={false}
    />
  );
};

export default React.memo(EventInfoTabs);
