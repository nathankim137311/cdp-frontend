import React, { FC, useMemo } from "react";

import MatterSponsor from "../../models/MatterSponsor";

import LazyFetchDataContainer from "../FetchDataContainer/LazyFetchDataContainer";
import { FetchDataState } from "../FetchDataContainer/useFetchData";

import Details from "../../components/Shared/Details";
import H2 from "../../components/Shared/H2";
import Ul from "../../components/Shared/Ul";

import { strings } from "../../assets/LocalizedStrings";

interface MattersSponsoredProps {
  mattersSponsored: FetchDataState<MatterSponsor[]>;
}

const MattersSponsored: FC<MattersSponsoredProps> = ({
  mattersSponsored,
}: MattersSponsoredProps) => {
  const hiddenContent = useMemo(() => {
    return (
      <LazyFetchDataContainer
        data="legislations"
        isLoading={mattersSponsored.isLoading}
        error={mattersSponsored.error}
        notFound={!mattersSponsored.data || mattersSponsored.data.length === 0}
      >
        {mattersSponsored.data && (
          <Ul gap={8}>
            {mattersSponsored.data.map((matterSponsored) => (
              <li key={matterSponsored.id}>
                <dl>
                  <dt>
                    <strong>{matterSponsored.matter?.name}</strong>
                  </dt>
                  <dd>{matterSponsored.matter?.title}</dd>
                </dl>
              </li>
            ))}
          </Ul>
        )}
      </LazyFetchDataContainer>
    );
  }, [mattersSponsored]);

  return (
    <div style={{ marginTop: 16 }}>
      <Details
        hasBorderBottom={true}
        defaultOpen={false}
        summaryContent={
          <H2 className="mzp-u-title-xs" isInline={true}>
            {strings.legislation_sponsored}
          </H2>
        }
        hiddenContent={hiddenContent}
      />
    </div>
  );
};

export default MattersSponsored;
