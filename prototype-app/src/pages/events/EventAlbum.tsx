import { ArrowSquareOutIcon as ArrowSquareOut, ImagesIcon as Images } from '@coreds/react/icons';
import type { EventItem } from '../../types';

/** Album ảnh sự kiện đã diễn ra — gắn thẳng vào trang sự kiện thay vì link Drive rời rạc (yêu cầu COM). */
export function EventAlbum({ album }: { album: NonNullable<EventItem['album']> }) {
  return (
    <section className="article-body events-v2-album" aria-label="Album ảnh sự kiện">
      <h2><Images size={18} /> Album ảnh <small>{album.photos.length} ảnh</small></h2>
      <div className="events-v2-album-grid">
        {album.photos.map((photo, index) => (
          <figure key={`${photo.caption}-${index}`} className={`events-v2-album-tile events-v2-cover events-v2-cover--${photo.palette}`}>
            <span className="events-v2-cover-emoji" aria-hidden="true">{photo.emoji}</span>
            <figcaption>{photo.caption}</figcaption>
          </figure>
        ))}
      </div>
      {album.driveUrl && (
        <a className="text-link" href={album.driveUrl} target="_blank" rel="noreferrer">
          Mở album đầy đủ trên Drive<ArrowSquareOut size={14} />
        </a>
      )}
    </section>
  );
}
